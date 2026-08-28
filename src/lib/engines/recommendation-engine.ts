import { ActionRecommendation, Disease, RiskPrediction, WeatherObservation, EconomicAnalysis } from '@/types';

export interface RecommendationParams {
  disease: Disease;
  riskPrediction: RiskPrediction;
  weather?: WeatherObservation;
  economicAnalysis?: EconomicAnalysis;
}

/**
 * Agronomic Action Recommendation Engine complying with PRD §13 & §14 Safety Rules.
 * Never outputs specific chemical dosage; focuses on safe cultural & bio-control practices.
 */
export function generateActionRecommendation(params: RecommendationParams): ActionRecommendation {
  const { disease, riskPrediction, weather, economicAnalysis } = params;

  const riskScore = riskPrediction.risk_score;
  let priority: 'high' | 'medium' | 'low' = 'medium';
  let timing: 'within_24_hours' | 'within_48_hours' | 'within_72_hours' | 'routine_monitoring' = 'within_48_hours';

  if (riskScore >= 75) {
    priority = 'high';
    timing = 'within_24_hours';
  } else if (riskScore >= 50) {
    priority = 'high';
    timing = 'within_48_hours';
  } else if (riskScore >= 25) {
    priority = 'medium';
    timing = 'within_72_hours';
  } else {
    priority = 'low';
    timing = 'routine_monitoring';
  }

  // Construct clear, actionable reason grounded in live variables
  let reason = `Environmental conditions (Risk: ${riskScore}/100)`;
  if (weather && weather.humidity >= disease.risk_rules.min_humidity) {
    reason += ` with high relative humidity (${weather.humidity}%) and favorable temperatures (${weather.temperature}°C) are accelerating ${disease.name} pathogen reproduction.`;
  } else {
    reason += ` indicate active disease pressure requiring prophylactic monitoring.`;
  }

  let action = `Conduct immediate field scouting across the lower canopy. If symptoms exceed economic threshold, apply locally approved bio-control practices.`;
  if (riskScore >= 75) {
    action = `Immediately isolate affected plots, drain excess standing water, and consult your local Krishi Vigyan Kendra (KVK) or extension officer for certified interventions.`;
  }

  const culturalMeasures = [
    disease.management_guidance.cultural,
    'Ensure field bunds and irrigation channels are cleared of weed hosts.',
    'Avoid nitrogen over-application during active disease outbreaks.',
  ];

  const biologicalMeasures = [
    disease.management_guidance.biological,
    'Apply bio-fungicide/bactericide during early morning or evening hours for maximum spore efficacy.',
  ];

  if (economicAnalysis && economicAnalysis.net_benefit > 0) {
    reason += ` Timely action can prevent an estimated potential loss of ₹${economicAnalysis.avoided_loss.toLocaleString('en-IN')}.`;
  }

  return {
    priority,
    timing,
    action,
    reason,
    cultural_measures: culturalMeasures,
    biological_measures: biologicalMeasures,
    safety_notice:
      'Disclaimer: Recommendations prioritize cultural and biological practices. For chemical interventions or specific dosages, strictly consult locally approved agricultural extension authorities (ICAR / State Agriculture Department).',
  };
}
