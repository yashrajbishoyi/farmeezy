import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { mockDb } from '@/lib/supabase/mock-db';
import { runSpreadSimulation } from '@/lib/engines/simulation-engine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { farm_id, disease_id, initial_risk_score, propagation_factor, weather_modifier, delay_days } = body;

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
      propagationFactor: propagation_factor,
      weatherModifier: weather_modifier,
      delayDays: delay_days ? parseInt(delay_days, 10) : 3,
    });

    return NextResponse.json({ success: true, data: simulation });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
