import { NextResponse } from 'next/server';
import { mockDb } from '@/lib/supabase/mock-db';
import { runSpreadSimulation } from '@/lib/engines/simulation-engine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { farm_id, disease_id, initial_risk_score, propagation_factor, weather_modifier, delay_days } = body;

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
      propagationFactor: propagation_factor,
      weatherModifier: weather_modifier,
      delayDays: delay_days ? parseInt(delay_days, 10) : 3,
    });

    return NextResponse.json({ success: true, data: simulation });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
