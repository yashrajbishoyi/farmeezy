import { describe, it, expect } from 'vitest';
import { calculateEconomicImpact } from '../lib/engines/economic-engine';
import { DEMO_PRIMARY_FARM } from '../lib/seeds/demo-farms';
import { runSpreadSimulation } from '../lib/engines/simulation-engine';
import { SEED_DISEASES } from '../lib/seeds/diseases';

describe('Economic Engine (PRD §12 Formulas)', () => {
  const farm = DEMO_PRIMARY_FARM; // 3.5 acres, 22.5 quintals/acre, ₹2,183/quintal
  const disease = SEED_DISEASES[0];

  it('calculates gross crop value, avoided loss, net benefit and ROI correctly', () => {
    const sim = runSpreadSimulation({
      primaryFarm: farm,
      neighborFarms: [],
      initialRiskScore: 81,
      disease,
    });

    const econ = calculateEconomicImpact({
      farm,
      noActionScenario: sim.scenarios.no_action,
      interveneTodayScenario: sim.scenarios.intervene_today,
      interveneDelayedScenario: sim.scenarios.intervene_after_3_days,
      costPerAcre: 650,
    });

    // 3.5 acres * 22.5 quintals * 2183 = ~171,911 INR
    const expectedGross = Math.round(3.5 * 22.5 * 2183);
    expect(econ.gross_crop_value).toBe(expectedGross);

    // Intervention cost = 3.5 * 650 = 2275 INR
    expect(econ.intervention_cost).toBe(Math.round(3.5 * 650));

    // Avoided loss = no_action loss - intervene_today loss
    expect(econ.avoided_loss).toBe(
      sim.scenarios.no_action.estimated_loss - sim.scenarios.intervene_today.estimated_loss
    );

    // Net benefit = avoided_loss - intervention_cost
    expect(econ.net_benefit).toBe(Math.max(0, econ.avoided_loss - econ.intervention_cost));

    // Positive ROI when avoided loss exceeds cost
    expect(econ.roi_percentage).toBeGreaterThan(0);
    expect(econ.disclaimer).toContain('Estimated values based on model assumptions');
  });
});
