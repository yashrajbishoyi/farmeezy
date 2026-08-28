import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { mockDb } from '@/lib/supabase/mock-db';
import { calculateEconomicImpact } from '@/lib/engines/economic-engine';
import { runSpreadSimulation } from '@/lib/engines/simulation-engine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { farm_id, disease_id, initial_risk_score, cost_per_acre } = body;

    const supabase = createServerSupabaseClient();

    let farm: any = null;
    if (supabase) {
      const { data, error } = await supabase
        .from('farms')
        .select('*, crop:crops(*)')
        .eq('id', farm_id)
        .single();
      if (!error && data) farm = data;
    }
    if (!farm) farm = mockDb.getFarmById(farm_id);
    if (!farm) {
      return NextResponse.json({ success: false, error: 'Farm not found' }, { status: 404 });
    }

    let disease: any = null;
    if (supabase && disease_id) {
      const { data } = await supabase.from('diseases').select('*').eq('id', disease_id).single();
      if (data) disease = data;
    }
    if (!disease) disease = mockDb.getDiseaseById(disease_id) || mockDb.getDiseases(farm.crop_id)[0];

    let neighbors: any[] = [];
    if (supabase) {
      const { data, error } = await supabase
        .from('farms')
        .select('*, crop:crops(*)')
        .neq('id', farm.id);
      if (!error && data) neighbors = data;
    }
    if (!neighbors.length) neighbors = mockDb.getFarms().filter((f: any) => f.id !== farm.id);

    const simulation = runSpreadSimulation({
      primaryFarm: farm,
      neighborFarms: neighbors,
      initialRiskScore: initial_risk_score || 81,
      disease,
    });

    const economicAnalysis = calculateEconomicImpact({
      farm,
      noActionScenario: simulation.scenarios.no_action,
      interveneTodayScenario: simulation.scenarios.intervene_today,
      interveneDelayedScenario: simulation.scenarios.intervene_after_3_days,
      costPerAcre: cost_per_acre || 650,
    });

    return NextResponse.json({ success: true, data: economicAnalysis });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
