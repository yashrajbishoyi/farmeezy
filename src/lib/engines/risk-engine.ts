import { 
  FactorBreakdown, 
  RiskPrediction, 
  RiskForecastPoint, 
  SeverityLevel, 
  Disease, 
  GrowthStage, 
  WeatherObservation, 
  WeatherForecastDay,
  DiseaseReport 
} from '@/types';

export interface RiskEngineWeights {
  vision: number; // 0.35
  weather: number; // 0.20
  growth_stage: number; // 0.15
  regional_pressure: number; // 0.15
  historical: number; // 0.10
  vegetation_anomaly?: number; // 0.05 (optional)
}

export const DEFAULT_RISK_WEIGHTS: RiskEngineWeights = {
  vision: 0.35,
  weather: 0.20,
  growth_stage: 0.15,
  regional_pressure: 0.15,
  historical: 0.10,
  vegetation_anomaly: 0.05,
};

export function getRiskLevel(score: number): SeverityLevel {
  if (score >= 75) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 25) return 'moderate';
  return 'low';
}

export interface RiskInputParams {
  farmId: string;
  disease: Disease;
  growthStage?: GrowthStage;
  visionConfidence?: number; // 0.0 to 1.0 (from Gemini or diagnosis)
  currentWeather?: WeatherObservation;
  forecastWeather?: WeatherForecastDay[];
  nearbyReports?: DiseaseReport[]; // reports within 10 km in last 14 days
  historicalOutbreakFrequency?: number; // 0.0 to 1.0
  vegetationAnomaly?: number; // 0.0 to 1.0 (if satellite NDVI anomaly available)
  weights?: Partial<RiskEngineWeights>;
}

/**
 * Pure, deterministic calculation of disease risk score according to PRD §9.
 */
export function calculateDiseaseRisk(params: RiskInputParams): RiskPrediction {
  const {
    farmId,
    disease,
    growthStage,
    visionConfidence = 0.5,
    currentWeather,
    forecastWeather = [],
    nearbyReports = [],
    historicalOutbreakFrequency = 0.6,
    vegetationAnomaly,
    weights: customWeights,
  } = params;

  // Resolve weights (redistribute vegetation anomaly if missing)
  const weights: RiskEngineWeights = { ...DEFAULT_RISK_WEIGHTS, ...customWeights };
  let wVision = weights.vision;
  let wWeather = weights.weather;
  let wGrowth = weights.growth_stage;
  let wPressure = weights.regional_pressure;
  let wHistory = weights.historical;

  if (vegetationAnomaly === undefined) {
    const remainingWeight = weights.vegetation_anomaly || 0.05;
    // Redistribute proportionally over vision, weather, growth, pressure
    const baseSum = wVision + wWeather + wGrowth + wPressure + wHistory;
    wVision += (wVision / baseSum) * remainingWeight;
    wWeather += (wWeather / baseSum) * remainingWeight;
    wGrowth += (wGrowth / baseSum) * remainingWeight;
    wPressure += (wPressure / baseSum) * remainingWeight;
    wHistory += (wHistory / baseSum) * remainingWeight;
  }

  // 1. Vision Factor (0-100)
  const visionScore = Math.min(100, Math.max(0, visionConfidence * 100));

  // 2. Weather Factor (0-100) based on disease-specific risk rules
  let weatherScore = 50; // default moderate
  if (currentWeather) {
    let score = 0;
    const temp = currentWeather.temperature;
    const hum = currentWeather.humidity;
    const rain = currentWeather.rainfall;

    // Temperature suitability
    if (temp >= disease.risk_rules.optimal_temp_min && temp <= disease.risk_rules.optimal_temp_max) {
      score += 40; // in optimal range
    } else if (Math.abs(temp - disease.risk_rules.optimal_temp_min) <= 4 || Math.abs(temp - disease.risk_rules.optimal_temp_max) <= 4) {
      score += 20; // marginal
    } else {
      score += 5;
    }

    // Humidity suitability
    if (hum >= disease.risk_rules.min_humidity) {
      score += 40;
    } else if (hum >= disease.risk_rules.min_humidity - 15) {
      score += 20;
    } else {
      score += 10;
    }

    // Rainfall / leaf wetness
    if (disease.risk_rules.rain_favorable && rain > 0) {
      score += 20;
    } else if (disease.risk_rules.rain_favorable && currentWeather.precip_probability > 60) {
      score += 15;
    } else {
      score += 5;
    }

    weatherScore = Math.min(100, score);
  }

  // 3. Growth Stage Susceptibility (0-100)
  const growthScore = growthStage ? Math.round(growthStage.susceptibility * 100) : 60;

  // 4. Regional Disease Pressure (0-100)
  // Evaluated based on count and severity of nearby verified reports
  let pressureScore = 15;
  if (nearbyReports.length > 0) {
    const reportWeights = nearbyReports.reduce((acc, rep) => {
      let sevMultiplier = 1.0;
      if (rep.severity === 'critical') sevMultiplier = 2.0;
      else if (rep.severity === 'high') sevMultiplier = 1.5;
      else if (rep.severity === 'moderate') sevMultiplier = 1.0;
      else sevMultiplier = 0.5;

      return acc + rep.confidence * sevMultiplier;
    }, 0);

    // Scale report pressure: >= 8 weighted reports saturate to 100
    pressureScore = Math.min(100, Math.round((reportWeights / 8) * 100));
  }

  // 5. Historical Risk (0-100)
  const historyScore = Math.round(historicalOutbreakFrequency * 100);

  // Calculate deterministic weighted total
  let totalScore =
    wVision * visionScore +
    wWeather * weatherScore +
    wGrowth * growthScore +
    wPressure * pressureScore +
    wHistory * historyScore;

  if (vegetationAnomaly !== undefined) {
    const anomalyScore = Math.round(vegetationAnomaly * 100);
    totalScore += (weights.vegetation_anomaly || 0.05) * anomalyScore;
  }

  const finalRiskScore = Math.min(100, Math.max(0, Math.round(totalScore)));
  const finalRiskLevel = getRiskLevel(finalRiskScore);

  // Compute factor breakdown
  const factors: FactorBreakdown[] = [
    {
      name: 'Vision Diagnosis Confidence',
      score: Math.round(visionScore),
      weight: Number(wVision.toFixed(2)),
      impact: Math.round(wVision * visionScore),
      description: `${Math.round(visionConfidence * 100)}% visual symptom match for ${disease.name}`,
    },
    {
      name: 'Micro-climate & Weather Suitability',
      score: Math.round(weatherScore),
      weight: Number(wWeather.toFixed(2)),
      impact: Math.round(wWeather * weatherScore),
      description: currentWeather
        ? `${currentWeather.humidity}% humidity, ${currentWeather.temperature}°C (Optimal: ${disease.risk_rules.optimal_temp_min}–${disease.risk_rules.optimal_temp_max}°C)`
        : 'Favorable seasonal humidity and temperature index',
    },
    {
      name: 'Crop Growth Stage Susceptibility',
      score: Math.round(growthScore),
      weight: Number(wGrowth.toFixed(2)),
      impact: Math.round(wGrowth * growthScore),
      description: growthStage
        ? `${growthStage.stage} stage (${Math.round(growthStage.susceptibility * 100)}% vulnerability)`
        : 'Active vegetative to heading period',
    },
    {
      name: 'Regional Cluster Pressure',
      score: Math.round(pressureScore),
      weight: Number(wPressure.toFixed(2)),
      impact: Math.round(wPressure * pressureScore),
      description: `${nearbyReports.length} verified ${disease.name} cases within 10 km`,
    },
    {
      name: 'Historical Area Outbreak Frequency',
      score: Math.round(historyScore),
      weight: Number(wHistory.toFixed(2)),
      impact: Math.round(wHistory * historyScore),
      description: 'Historical regional endemicity index',
    },
  ];

  // 7-day forecast curve (PRD §9)
  const forecast: RiskForecastPoint[] = [];
  const baseWeather = weatherScore;

  if (forecastWeather.length > 0) {
    forecastWeather.slice(0, 7).forEach((day, index) => {
      // Re-evaluate weather factor for that day
      let dayWeatherScore = 40;
      const avgTemp = (day.temp_max + day.temp_min) / 2;
      if (avgTemp >= disease.risk_rules.optimal_temp_min && avgTemp <= disease.risk_rules.optimal_temp_max) {
        dayWeatherScore += 35;
      }
      if (day.humidity_mean >= disease.risk_rules.min_humidity) {
        dayWeatherScore += 35;
      } else if (day.humidity_mean >= 75) {
        dayWeatherScore += 20;
      }
      if (day.rainfall_sum > 2 || day.precip_probability_max > 60) {
        dayWeatherScore += 20;
      }

      dayWeatherScore = Math.min(100, dayWeatherScore);

      // Trend: without intervention, vision & pressure compounding + new weather
      const compoundingVision = Math.min(100, visionScore + index * 3);
      const compoundingPressure = Math.min(100, pressureScore + index * 2.5);

      const dayRisk = Math.min(
        100,
        Math.max(
          0,
          Math.round(
            wVision * compoundingVision +
              wWeather * dayWeatherScore +
              wGrowth * growthScore +
              wPressure * compoundingPressure +
              wHistory * historyScore
          )
        )
      );

      forecast.push({
        date: day.date,
        day_offset: index,
        risk_score: dayRisk,
        risk_level: getRiskLevel(dayRisk),
        weather_factor: dayWeatherScore,
        rainfall_expected: day.rainfall_sum,
      });
    });
  } else {
    // Fallback synthetic 7-day trajectory
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const simulatedDayWeather = Math.min(100, Math.max(20, baseWeather + (i % 2 === 0 ? 5 : -3)));
      const simulatedRisk = Math.min(100, Math.round(finalRiskScore + i * 2.2));

      forecast.push({
        date: d.toISOString().split('T')[0],
        day_offset: i,
        risk_score: simulatedRisk,
        risk_level: getRiskLevel(simulatedRisk),
        weather_factor: simulatedDayWeather,
        rainfall_expected: i % 3 === 0 ? 8.5 : 0,
      });
    }
  }

  return {
    farm_id: farmId,
    disease_id: disease.id,
    disease_name: disease.name,
    risk_score: finalRiskScore,
    risk_level: finalRiskLevel,
    forecast_json: forecast,
    factors_json: factors,
    created_at: new Date().toISOString(),
  };
}
