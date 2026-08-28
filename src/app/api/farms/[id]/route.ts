import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { mockDb } from '@/lib/supabase/mock-db';
import { getFarmWeather } from '@/lib/services/weather';
import { calculateDiseaseRisk } from '@/lib/engines/risk-engine';
import { runSpreadSimulation } from '@/lib/engines/simulation-engine';
import { calculateEconomicImpact } from '@/lib/engines/economic-engine';
import { generateActionRecommendation } from '@/lib/engines/recommendation-engine';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const farmId = params.id;
    const supabase = createServerSupabaseClient();

    // --- Farm ---
    let farm: any = null;
    if (supabase) {
      const { data, error } = await supabase
        .from('farms')
        .select('*, crop:crops(*)')
        .eq('id', farmId)
        .single();
      if (!error && data) farm = data;
    }
    if (!farm) farm = mockDb.getFarmById(farmId);
    if (!farm) {
      return NextResponse.json({ success: false, error: 'Farm not found' }, { status: 404 });
    }

    // --- Diagnoses history ---
    let diagnoses: any[] = [];
    if (supabase) {
      const { data, error } = await supabase
        .from('diagnoses')
        .select('*, disease:diseases(*)')
        .eq('farm_id', farmId)
        .order('created_at', { ascending: false });
      if (!error && data) diagnoses = data;
    }
    if (!diagnoses.length) diagnoses = mockDb.getDiagnosesByFarmId(farmId);
    const latestDiagnosis = diagnoses[0];

    // --- Weather (always live from Open-Meteo) ---
    const weather = await getFarmWeather(farm.lat, farm.lng, farm.id);

    const { searchParams } = new URL(request.url);
    const requestedDiseaseId = searchParams.get('disease_id');

    // --- Available diseases for this crop ---
    let availableDiseases: any[] = [];
    if (supabase) {
      const { data, error } = await supabase
        .from('diseases')
        .select('*')
        .eq('crop_id', farm.crop_id);
      if (!error && data) availableDiseases = data;
    }
    if (!availableDiseases.length) availableDiseases = mockDb.getDiseases(farm.crop_id);

    const diseaseId =
      requestedDiseaseId ||
      latestDiagnosis?.disease_id ||
      (farm.crop_id === 'rice' ? 'rice_blast' : availableDiseases[0]?.id);

    // Fetch the specific target disease
    let disease: any = availableDiseases.find((d: any) => d.id === diseaseId) || availableDiseases[0];
    if (!disease && supabase && diseaseId) {
      const { data } = await supabase.from('diseases').select('*').eq('id', diseaseId).single();
      if (data) disease = data;
    }
    if (!disease) disease = mockDb.getDiseaseById(diseaseId) || availableDiseases[0];

    // --- Growth stage from sowing date ---
    let growthStage = undefined;
    if (farm.crop && farm.sowing_date) {
      const daysSinceSowing = Math.max(
        0,
        Math.floor((Date.now() - new Date(farm.sowing_date).getTime()) / (24 * 60 * 60 * 1000))
      );
      const stages = farm.crop?.growth_stages ?? [];
      growthStage = stages.find(
        (st: any) => daysSinceSowing >= st.days_start && daysSinceSowing <= st.days_end
      );
    }

    // --- Nearby disease reports for regional pressure ---
    let nearbyReports: any[] = [];
    if (supabase) {
      const { data, error } = await supabase
        .from('disease_reports')
        .select('*, disease:diseases(*)')
        .eq('disease_id', disease?.id)
        .order('reported_at', { ascending: false });
      if (!error && data) nearbyReports = data;
    }
    if (!nearbyReports.length) {
      nearbyReports = mockDb.getDiseaseReports({
        disease_id: disease?.id,
        lat: farm.lat,
        lng: farm.lng,
        radius_km: 10,
      });
    }

    // --- Run deterministic Risk Engine (PRD §9) ---
    const riskPrediction = disease
      ? calculateDiseaseRisk({
          farmId: farm.id,
          disease,
          growthStage,
          visionConfidence: latestDiagnosis?.confidence || 0.85,
          currentWeather: weather.current,
          forecastWeather: weather.daily,
          nearbyReports,
          historicalOutbreakFrequency: 0.75,
        })
      : null;

    // --- Run Simulation Engine (PRD §11) ---
    let neighborFarms: any[] = [];
    if (supabase) {
      const { data, error } = await supabase
        .from('farms')
        .select('*, crop:crops(*)')
        .neq('id', farm.id);
      if (!error && data) neighborFarms = data;
    }
    if (!neighborFarms.length) neighborFarms = mockDb.getFarms().filter((f: any) => f.id !== farm.id);

    const simulation =
      disease && riskPrediction
        ? runSpreadSimulation({
            primaryFarm: farm,
            neighborFarms,
            initialRiskScore: riskPrediction.risk_score,
            disease,
          })
        : null;

    // --- Run Economic Impact Engine (PRD §12) ---
    const economicAnalysis =
      simulation && simulation.scenarios
        ? calculateEconomicImpact({
            farm,
            noActionScenario: simulation.scenarios.no_action,
            interveneTodayScenario: simulation.scenarios.intervene_today,
            interveneDelayedScenario: simulation.scenarios.intervene_after_3_days,
          })
        : null;

    // --- Generate Agronomic Action Recommendation (PRD §13) ---
    const recommendation =
      disease && riskPrediction
        ? generateActionRecommendation({
            disease,
            riskPrediction,
            weather: weather.current,
            economicAnalysis: economicAnalysis || undefined,
          })
        : null;

    // --- Alerts ---
    let alerts: any[] = [];
    if (supabase) {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('farm_id', farmId)
        .order('created_at', { ascending: false });
      if (!error && data) alerts = data;
    }
    if (!alerts.length) alerts = mockDb.getAlerts(farmId);

    return NextResponse.json({
      success: true,
      data: {
        farm,
        latestDiagnosis,
        diagnoses,
        weather,
        disease,
        availableDiseases,
        growthStage,
        riskPrediction,
        simulation,
        economicAnalysis,
        recommendation,
        alerts,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
