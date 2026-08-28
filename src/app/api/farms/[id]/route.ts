import { NextResponse } from 'next/server';
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
    const farm = mockDb.getFarmById(farmId);

    if (!farm) {
      return NextResponse.json({ success: false, error: 'Farm not found' }, { status: 404 });
    }

    // Diagnoses history
    const diagnoses = mockDb.getDiagnosesByFarmId(farmId);
    const latestDiagnosis = diagnoses[0];

    // Weather
    const weather = await getFarmWeather(farm.lat, farm.lng, farm.id);

    const { searchParams } = new URL(request.url);
    const requestedDiseaseId = searchParams.get('disease_id');

    // Default or requested target disease
    const availableDiseases = mockDb.getDiseases(farm.crop_id);
    const diseaseId = requestedDiseaseId || latestDiagnosis?.disease_id || (farm.crop_id === 'rice' ? 'rice_blast' : availableDiseases[0]?.id);
    const disease = mockDb.getDiseaseById(diseaseId) || availableDiseases[0];

    // Calculate growth stage based on sowing date
    let growthStage = undefined;
    if (farm.crop && farm.sowing_date) {
      const daysSinceSowing = Math.max(
        0,
        Math.floor((Date.now() - new Date(farm.sowing_date).getTime()) / (24 * 60 * 60 * 1000))
      );
      growthStage = farm.crop.growth_stages.find(
        st => daysSinceSowing >= st.days_start && daysSinceSowing <= st.days_end
      );
    }

    // Nearby reports for regional pressure
    const nearbyReports = mockDb.getDiseaseReports({
      disease_id: disease?.id,
      lat: farm.lat,
      lng: farm.lng,
      radius_km: 10,
    });

    // Run deterministic Risk Engine (PRD §9)
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

    // Run Simulation Engine (PRD §11)
    const neighborFarms = mockDb.getFarms().filter(f => f.id !== farm.id);
    const simulation = (disease && riskPrediction)
      ? runSpreadSimulation({
          primaryFarm: farm,
          neighborFarms,
          initialRiskScore: riskPrediction.risk_score,
          disease,
        })
      : null;

    // Run Economic Impact Engine (PRD §12)
    const economicAnalysis = (simulation && simulation.scenarios)
      ? calculateEconomicImpact({
          farm,
          noActionScenario: simulation.scenarios.no_action,
          interveneTodayScenario: simulation.scenarios.intervene_today,
          interveneDelayedScenario: simulation.scenarios.intervene_after_3_days,
        })
      : null;

    // Generate Agronomic Action Recommendation (PRD §13)
    const recommendation = (disease && riskPrediction)
      ? generateActionRecommendation({
          disease,
          riskPrediction,
          weather: weather.current,
          economicAnalysis: economicAnalysis || undefined,
        })
      : null;

    // Alerts
    const alerts = mockDb.getAlerts(farmId);

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
