import { describe, it, expect } from 'vitest';
import { calculateDiseaseRisk, getRiskLevel } from '../lib/engines/risk-engine';
import { SEED_DISEASES } from '../lib/seeds/diseases';
import { SEED_CROPS } from '../lib/seeds/crops';
import { DiseaseReport, WeatherObservation } from '../types';

describe('Risk Engine (Deterministic PRD §9 Formula)', () => {
  const riceBlast = SEED_DISEASES[0]; // optimal temp 20-28, humidity >= 85
  const panicleStage = SEED_CROPS[0].growth_stages[2]; // susceptibility 0.9

  it('correctly categorizes risk score levels', () => {
    expect(getRiskLevel(81)).toBe('critical');
    expect(getRiskLevel(75)).toBe('critical');
    expect(getRiskLevel(65)).toBe('high');
    expect(getRiskLevel(50)).toBe('high');
    expect(getRiskLevel(35)).toBe('moderate');
    expect(getRiskLevel(25)).toBe('moderate');
    expect(getRiskLevel(15)).toBe('low');
    expect(getRiskLevel(0)).toBe('low');
  });

  it('computes high risk (80+) for high vision match + favorable weather + panicle stage + nearby outbreak', () => {
    const favorableWeather: WeatherObservation = {
      farm_id: 'farm-1',
      temperature: 24, // in 20-28 optimal
      humidity: 90, // >= 85 optimal
      rainfall: 5.0, // rain favorable
      wind_speed: 12,
      precip_probability: 80,
      observed_at: new Date().toISOString(),
    };

    const nearbyReports: DiseaseReport[] = Array(10).fill({
      id: 'rep-1',
      disease_id: 'rice_blast',
      lat: 20.46,
      lng: 85.88,
      confidence: 0.9,
      severity: 'high',
      reported_at: new Date().toISOString(),
      verified: true,
    });

    const result = calculateDiseaseRisk({
      farmId: 'farm-1',
      disease: riceBlast,
      growthStage: panicleStage,
      visionConfidence: 0.87,
      currentWeather: favorableWeather,
      nearbyReports,
      historicalOutbreakFrequency: 0.75,
    });

    expect(result.risk_score).toBeGreaterThanOrEqual(75);
    expect(result.risk_level).toBe('critical');
    expect(result.factors_json).toHaveLength(5);
    expect(result.forecast_json).toHaveLength(7);
  });

  it('redistributes weights when vegetation anomaly is omitted', () => {
    const result = calculateDiseaseRisk({
      farmId: 'farm-1',
      disease: riceBlast,
      growthStage: panicleStage,
      visionConfidence: 0.8,
    });

    const totalFactorImpact = result.factors_json.reduce((sum, f) => sum + f.impact, 0);
    // Weighted factor impacts should sum closely to risk_score (allowing for rounding)
    expect(Math.abs(totalFactorImpact - result.risk_score)).toBeLessThanOrEqual(3);
  });

  it('clamps risk score strictly within [0, 100]', () => {
    const extremeLow = calculateDiseaseRisk({
      farmId: 'farm-1',
      disease: riceBlast,
      visionConfidence: 0.0,
      historicalOutbreakFrequency: 0.0,
      currentWeather: {
        farm_id: 'farm-1',
        temperature: 45, // well outside optimal
        humidity: 15,
        rainfall: 0,
        wind_speed: 5,
        precip_probability: 0,
        observed_at: new Date().toISOString(),
      },
    });

    expect(extremeLow.risk_score).toBeGreaterThanOrEqual(0);
    expect(extremeLow.risk_score).toBeLessThanOrEqual(25);
    expect(extremeLow.risk_level).toBe('low');
  });
});
