import { mockDb } from '@/lib/supabase/mock-db';
import { getFallbackWeather } from '@/lib/services/weather';
import { calculateDiseaseRisk } from '@/lib/engines/risk-engine';
import { runSpreadSimulation } from '@/lib/engines/simulation-engine';
import { calculateEconomicImpact } from '@/lib/engines/economic-engine';
import { generateActionRecommendation } from '@/lib/engines/recommendation-engine';

export function getInitialFarmData(farmId: string, targetDiseaseId?: string) {
  const farm = mockDb.getFarmById(farmId);
  if (!farm) return null;

  const diagnoses = mockDb.getDiagnosesByFarmId(farmId);
  const latestDiagnosis = diagnoses[0];
  const weather = getFallbackWeather(farm.lat, farm.lng, farm.id);
  const availableDiseases = mockDb.getDiseases(farm.crop_id);

  const diseaseId =
    targetDiseaseId ||
    latestDiagnosis?.disease_id ||
    (farm.crop_id === 'rice' ? 'rice_blast' : availableDiseases[0]?.id);

  const disease = mockDb.getDiseaseById(diseaseId) || availableDiseases[0];

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

  const nearbyReports = mockDb.getDiseaseReports({
    disease_id: disease?.id,
    lat: farm.lat,
    lng: farm.lng,
    radius_km: 10,
  });

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

  const neighborFarms = mockDb.getFarms().filter((f: any) => f.id !== farm.id);

  const simulation =
    disease && riskPrediction
      ? runSpreadSimulation({
          primaryFarm: farm,
          neighborFarms,
          initialRiskScore: riskPrediction.risk_score,
          disease,
        })
      : null;

  const economicAnalysis =
    simulation && simulation.scenarios
      ? calculateEconomicImpact({
          farm,
          noActionScenario: simulation.scenarios.no_action,
          interveneTodayScenario: simulation.scenarios.intervene_today,
          interveneDelayedScenario: simulation.scenarios.intervene_after_3_days,
        })
      : null;

  const recommendation =
    disease && riskPrediction
      ? generateActionRecommendation({
          disease,
          riskPrediction,
          weather: weather.current,
          economicAnalysis: economicAnalysis || undefined,
        })
      : null;

  const alerts = mockDb.getAlerts(farmId);

  return {
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
  };
}
