import { NextResponse } from 'next/server';
import { mockDb } from '@/lib/supabase/mock-db';
import { calculateEconomicImpact } from '@/lib/engines/economic-engine';
import { runSpreadSimulation } from '@/lib/engines/simulation-engine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { farm_id, disease_id, initial_risk_score, cost_per_acre } = body;

    const farm = mockDb.getFarmById(farm_id);
    if (!farm) {
      return NextResponse.json({ success: false, error: 'Farm not found' }, { status: 404 });
    }

    const disease = mockDb.getDiseaseById(disease_id) || mockDb.getDiseases(farm.crop_id)[0];
    const neighbors = mockDb.getFarms().filter(f => f.id !== farm.id);

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
