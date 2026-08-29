import { describe, it, expect } from 'vitest';
import { 
  calculateInterventionPriority, 
  rankFarmsByInterventionPriority,
  getInterventionPriorityTier,
  getInterventionActionGuidance
} from '../lib/engines/intervention-engine';
import { RiskPrediction, EconomicAnalysis, GrowthStage, OutbreakCluster } from '@/types';

describe('Intervention Priority Engine', () => {
  const mockRiskPrediction: RiskPrediction = {
    farm_id: 'farm-test-1',
    disease_id: 'rice_blast',
    disease_name: 'Rice Blast',
    risk_score: 85,
    risk_level: 'critical',
    factors_json: [],
    forecast_json: [],
    created_at: new Date().toISOString(),
  };

  const mockEconomicAnalysis: EconomicAnalysis = {
    gross_crop_value: 120000,
    potential_loss_without_action: 48000, // 40% loss
    potential_loss_with_action: 6000,
    potential_loss_delayed_action: 24000,
    avoided_loss: 42000,
    intervention_cost: 1625,
    net_benefit: 40375,
    roi_percentage: 2484,
    disclaimer: 'Test analysis',
  };

  const mockGrowthStage: GrowthStage = {
    stage: 'Panicle Initiation',
    days_start: 46,
    days_end: 75,
    susceptibility: 0.9,
  };

  const mockCluster: OutbreakCluster = {
    cluster_id: 'cluster-blast-1',
    center: { lat: 20.46, lng: 85.88 },
    radius_km: 3.5,
    report_count: 8,
    risk_level: 'critical',
    disease_id: 'rice_blast',
    disease_name: 'Rice Blast',
    growth_rate: 'accelerating',
    reports: [],
  };

  it('calculates deterministic intervention priority for high-threat farm', () => {
    // Farm located at same coordinates as accelerating cluster centroid
    const result = calculateInterventionPriority({
      farmId: 'farm-test-1',
      farmLat: 20.46,
      farmLng: 85.88,
      riskPrediction: mockRiskPrediction,
      economicAnalysis: mockEconomicAnalysis,
      growthStage: mockGrowthStage,
      activeClusters: [mockCluster],
    });

    // S_risk = 85 (0.40 * 85 = 34)
    // S_loss = 48000/120000 = 40 (0.30 * 40 = 12)
    // S_cluster = 100 (0.20 * 100 = 20)
    // S_growth = 90 (0.10 * 90 = 9)
    // Total = 34 + 12 + 20 + 9 = 75
    expect(result.priority_score).toBe(75);
    expect(result.priority_tier).toBe('critical');
    expect(result.economic_exposure_inr).toBe(48000);
    expect(result.avoidable_loss_inr).toBe(42000);
    expect(result.net_benefit_inr).toBe(40375);
    expect(result.factors).toHaveLength(4);
    expect(result.recommended_action).toContain('immediate field inspection');
  });

  it('evaluates low priority for low-threat plot with no active cluster', () => {
    const lowRisk: RiskPrediction = {
      ...mockRiskPrediction,
      risk_score: 15,
      risk_level: 'low',
    };

    const lowEconomic: EconomicAnalysis = {
      ...mockEconomicAnalysis,
      potential_loss_without_action: 6000, // 5% loss of 120,000
    };

    const lowGrowth: GrowthStage = {
      stage: 'Seedling',
      days_start: 0,
      days_end: 20,
      susceptibility: 0.2,
    };

    const result = calculateInterventionPriority({
      farmId: 'farm-test-2',
      farmLat: 20.90, // Far from cluster (>10km)
      farmLng: 86.50,
      riskPrediction: lowRisk,
      economicAnalysis: lowEconomic,
      growthStage: lowGrowth,
      activeClusters: [mockCluster],
    });

    // S_risk = 15 (0.40 * 15 = 6)
    // S_loss = 5 (0.30 * 5 = 1.5 -> 2)
    // S_cluster = 0 (0.20 * 0 = 0)
    // S_growth = 20 (0.10 * 20 = 2)
    // Total = ~9-10
    expect(result.priority_score).toBeLessThan(25);
    expect(result.priority_tier).toBe('low');
    expect(result.recommended_action).toContain('routine seasonal management');
  });

  it('correctly ranks multiple farms in descending order of priority', () => {
    const farmHigh = {
      farmId: 'farm-high',
      farmLat: 20.46,
      farmLng: 85.88,
      riskPrediction: mockRiskPrediction,
      economicAnalysis: mockEconomicAnalysis,
      growthStage: mockGrowthStage,
      activeClusters: [mockCluster],
    };

    const farmModerate = {
      farmId: 'farm-mod',
      farmLat: 20.46,
      farmLng: 85.88,
      riskPrediction: { ...mockRiskPrediction, risk_score: 50, risk_level: 'high' as const },
      economicAnalysis: { ...mockEconomicAnalysis, potential_loss_without_action: 24000 },
      growthStage: { ...mockGrowthStage, susceptibility: 0.6 },
      activeClusters: [],
    };

    const farmLow = {
      farmId: 'farm-low',
      farmLat: 20.90,
      farmLng: 86.50,
      riskPrediction: { ...mockRiskPrediction, risk_score: 10, risk_level: 'low' as const },
      economicAnalysis: { ...mockEconomicAnalysis, potential_loss_without_action: 2000 },
      growthStage: { ...mockGrowthStage, susceptibility: 0.1 },
      activeClusters: [],
    };

    const ranked = rankFarmsByInterventionPriority([farmLow, farmHigh, farmModerate]);

    expect(ranked[0].farm_id).toBe('farm-high');
    expect(ranked[1].farm_id).toBe('farm-mod');
    expect(ranked[2].farm_id).toBe('farm-low');
    expect(ranked[0].priority_score).toBeGreaterThan(ranked[1].priority_score);
    expect(ranked[1].priority_score).toBeGreaterThan(ranked[2].priority_score);
  });

  it('returns valid tiers and action strings for boundary threshold scores', () => {
    expect(getInterventionPriorityTier(75)).toBe('critical');
    expect(getInterventionPriorityTier(74)).toBe('high');
    expect(getInterventionPriorityTier(50)).toBe('high');
    expect(getInterventionPriorityTier(49)).toBe('moderate');
    expect(getInterventionPriorityTier(25)).toBe('moderate');
    expect(getInterventionPriorityTier(24)).toBe('low');
    expect(getInterventionPriorityTier(0)).toBe('low');

    expect(getInterventionActionGuidance('critical')).toContain('within 24 hours');
    expect(getInterventionActionGuidance('high')).toContain('within 48 hours');
    expect(getInterventionActionGuidance('moderate')).toContain('next 72 hours');
    expect(getInterventionActionGuidance('low')).toContain('routine');
  });
});
