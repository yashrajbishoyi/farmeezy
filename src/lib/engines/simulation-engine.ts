import { 
  Farm, 
  DiseaseReport, 
  ScenarioType, 
  SimulationScenarioResult, 
  Simulation,
  Disease
} from '@/types';

export interface SimulationParams {
  primaryFarm: Farm;
  neighborFarms: Farm[];
  initialRiskScore: number; // 0-100
  disease: Disease;
  diseaseReports?: DiseaseReport[];
  propagationFactor?: number; // default 0.18
  weatherModifier?: number; // e.g. 1.2 during wet spells, 0.8 during dry
  delayDays?: number; // default 3 days
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Graph propagation simulation engine.
 */
export function runSpreadSimulation(params: SimulationParams): Simulation {
  const {
    primaryFarm,
    neighborFarms,
    initialRiskScore,
    disease,
    propagationFactor = 0.18,
    weatherModifier = 1.15,
    delayDays = 3,
  } = params;

  // Farm value baseline for loss calculation
  const totalAcres = primaryFarm.area_acres;
  const yieldPerAcre = primaryFarm.crop?.base_yield_per_acre || 22.5;
  const pricePerUnit = primaryFarm.crop?.default_price_per_unit || 2183;
  const grossValue = totalAcres * yieldPerAcre * pricePerUnit;

  // Projection day steps
  const projectionDays = [0, 3, 7, 14];

  // Helper to run a specific scenario
  const simulateScenario = (scenario: ScenarioType): SimulationScenarioResult => {
    let scenarioName = 'No Intervention (Baseline)';
    if (scenario === 'intervene_today') scenarioName = 'Immediate Intervention (Day 0)';
    if (scenario === 'intervene_after_3_days') scenarioName = `Delayed Intervention (Day ${delayDays})`;

    const timeline: { day: number; risk_score: number; affected_acres: number }[] = [];
    const affectedCurves: number[] = [];

    let currentRisk = initialRiskScore;
    let currentAffectedPct = Math.min(60, Math.max(5, (initialRiskScore / 100) * 35));
    let peakRisk = currentRisk;

    for (let day = 0; day <= 14; day++) {
      // Apply intervention decay or compounding spread
      if (scenario === 'intervene_today' && day >= 1) {
        // Active bio-control/cultural containment suppresses propagation
        currentRisk = Math.max(12, currentRisk * 0.78);
        currentAffectedPct = Math.max(8, currentAffectedPct * 0.88);
      } else if (scenario === 'intervene_after_3_days') {
        if (day <= delayDays) {
          // Unchecked spread until Day X
          const spreadIncrement = (currentRisk * propagationFactor * weatherModifier) / 3.5;
          currentRisk = Math.min(100, currentRisk + spreadIncrement);
          currentAffectedPct = Math.min(85, currentAffectedPct + (spreadIncrement * 0.45));
        } else {
          // Intervention takes effect from Day X+1 onwards
          currentRisk = Math.max(22, currentRisk * 0.84);
          currentAffectedPct = Math.max(currentAffectedPct * 0.92, 18);
        }
      } else {
        // No action: unchecked exponential saturation
        const spreadIncrement = ((100 - currentRisk) * 0.08 + (currentRisk * propagationFactor * weatherModifier)) / 2.8;
        currentRisk = Math.min(98, currentRisk + spreadIncrement);
        currentAffectedPct = Math.min(92, currentAffectedPct + (currentRisk * 0.04));
      }

      if (currentRisk > peakRisk) peakRisk = currentRisk;

      if (projectionDays.includes(day)) {
        affectedCurves.push(Math.round(currentAffectedPct));
        timeline.push({
          day,
          risk_score: Math.round(currentRisk),
          affected_acres: Number(((currentAffectedPct / 100) * totalAcres).toFixed(2)),
        });
      }
    }

    const finalAffectedPercent = affectedCurves[affectedCurves.length - 1];
    // Yield loss factor: higher peak risk & longer disease duration causes heavier yield loss
    const yieldLossFactor = (finalAffectedPercent / 100) * (peakRisk / 100) * 0.75;
    const estimatedLoss = Math.round(grossValue * yieldLossFactor);

    return {
      scenario,
      scenario_name: scenarioName,
      days: projectionDays,
      affected_area_curve: affectedCurves,
      peak_risk: Math.round(peakRisk),
      affected_area_percent: finalAffectedPercent,
      estimated_loss: estimatedLoss,
      timeline,
    };
  };

  const scenarios: Record<ScenarioType, SimulationScenarioResult> = {
    no_action: simulateScenario('no_action'),
    intervene_today: simulateScenario('intervene_today'),
    intervene_after_3_days: simulateScenario('intervene_after_3_days'),
  };

  return {
    farm_id: primaryFarm.id,
    scenarios,
    parameters_json: {
      propagation_factor: propagationFactor,
      neighbor_pressure: neighborFarms.length,
      intervention_efficacy: 0.85,
    },
    created_at: new Date().toISOString(),
  };
}
