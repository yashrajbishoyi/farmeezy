import { EconomicAnalysis, Farm, SimulationScenarioResult } from '@/types';

export interface EconomicEngineParams {
  farm: Farm;
  noActionScenario: SimulationScenarioResult;
  interveneTodayScenario: SimulationScenarioResult;
  interveneDelayedScenario?: SimulationScenarioResult;
  costPerAcre?: number; // default INR 650 per acre (bio-agent + labor)
}

/**
 * Deterministic Economic Loss and Net Benefit Engine per PRD §12.
 */
export function calculateEconomicImpact(params: EconomicEngineParams): EconomicAnalysis {
  const {
    farm,
    noActionScenario,
    interveneTodayScenario,
    interveneDelayedScenario,
    costPerAcre = 650, // standard bio-control application cost per acre
  } = params;

  const area = farm.area_acres || 1.0;
  const yieldPerAcre = farm.crop?.base_yield_per_acre || 22.5; // quintals
  const pricePerUnit = farm.crop?.default_price_per_unit || 2183; // INR per quintal

  const grossCropValue = Math.round(area * yieldPerAcre * pricePerUnit);

  const potentialLossWithoutAction = noActionScenario.estimated_loss;
  const potentialLossWithAction = interveneTodayScenario.estimated_loss;
  const potentialLossDelayedAction = interveneDelayedScenario
    ? interveneDelayedScenario.estimated_loss
    : Math.round(potentialLossWithoutAction * 0.55);

  const avoidedLoss = Math.max(0, potentialLossWithoutAction - potentialLossWithAction);
  const totalInterventionCost = Math.round(area * costPerAcre);
  const netBenefit = Math.max(0, avoidedLoss - totalInterventionCost);

  const roiPercentage =
    totalInterventionCost > 0
      ? Math.round((netBenefit / totalInterventionCost) * 100)
      : 0;

  return {
    gross_crop_value: grossCropValue,
    potential_loss_without_action: potentialLossWithoutAction,
    potential_loss_with_action: potentialLossWithAction,
    potential_loss_delayed_action: potentialLossDelayedAction,
    avoided_loss: avoidedLoss,
    intervention_cost: totalInterventionCost,
    net_benefit: netBenefit,
    roi_percentage: roiPercentage,
    disclaimer: 'Estimated values based on model assumptions, market minimum support price (MSP), and standard ICAR damage functions.',
  };
}
