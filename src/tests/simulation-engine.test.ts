import { describe, it, expect } from 'vitest';
import { runSpreadSimulation } from '../lib/engines/simulation-engine';
import { DEMO_PRIMARY_FARM, SEED_FARMS } from '../lib/seeds/demo-farms';
import { SEED_DISEASES } from '../lib/seeds/diseases';

describe('Simulation Engine (Graph Propagation PRD §11)', () => {
  const primaryFarm = DEMO_PRIMARY_FARM;
  const neighbors = SEED_FARMS.slice(1, 10);
  const riceBlast = SEED_DISEASES[0];

  it('runs all three required scenarios with projection days [0, 3, 7, 14]', () => {
    const sim = runSpreadSimulation({
      primaryFarm,
      neighborFarms: neighbors,
      initialRiskScore: 81,
      disease: riceBlast,
    });

    expect(sim.scenarios).toHaveProperty('no_action');
    expect(sim.scenarios).toHaveProperty('intervene_today');
    expect(sim.scenarios).toHaveProperty('intervene_after_3_days');

    expect(sim.scenarios.no_action.days).toEqual([0, 3, 7, 14]);
    expect(sim.scenarios.intervene_today.days).toEqual([0, 3, 7, 14]);
    expect(sim.scenarios.intervene_after_3_days.days).toEqual([0, 3, 7, 14]);
  });

  it('verifies immediate intervention substantially lowers peak risk and estimated loss compared to no action', () => {
    const sim = runSpreadSimulation({
      primaryFarm,
      neighborFarms: neighbors,
      initialRiskScore: 81,
      disease: riceBlast,
    });

    const noAction = sim.scenarios.no_action;
    const interveneToday = sim.scenarios.intervene_today;
    const interveneDay3 = sim.scenarios.intervene_after_3_days;

    // No action should result in the highest affected area and loss
    expect(noAction.affected_area_percent).toBeGreaterThan(interveneToday.affected_area_percent);
    expect(noAction.estimated_loss).toBeGreaterThan(interveneToday.estimated_loss);

    // Delayed action should be between immediate intervention and no action
    expect(interveneDay3.estimated_loss).toBeGreaterThan(interveneToday.estimated_loss);
    expect(noAction.estimated_loss).toBeGreaterThan(interveneDay3.estimated_loss);
  });
});
