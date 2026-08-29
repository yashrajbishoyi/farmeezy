import { 
  RiskPrediction, 
  EconomicAnalysis, 
  GrowthStage, 
  OutbreakCluster,
  InterventionPriorityResult,
  InterventionPriorityTier,
  InterventionFactorDetail
} from '@/types';

export interface InterventionPriorityInput {
  farmId: string;
  farmLat: number;
  farmLng: number;
  riskPrediction: RiskPrediction;
  economicAnalysis: EconomicAnalysis;
  growthStage?: GrowthStage;
  activeClusters?: OutbreakCluster[];
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's mean radius in km
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

export function getInterventionPriorityTier(score: number): InterventionPriorityTier {
  if (score >= 75) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 25) return 'moderate';
  return 'low';
}

export function getInterventionActionGuidance(tier: InterventionPriorityTier): string {
  switch (tier) {
    case 'critical':
      return 'High biological risk and severe harvest exposure. Recommend immediate field inspection, plot isolation, and targeted bio-control application within 24 hours.';
    case 'high':
      return 'Elevated crop vulnerability and significant potential loss. Schedule bio-agent application and community border scouting within 48 hours.';
    case 'moderate':
      return 'Moderate risk level. Maintain field drainage, avoid excess nitrogen, and monitor symptom progression over the next 72 hours.';
    case 'low':
    default:
      return 'Low immediate threat. Continue standard crop scouting and routine seasonal management.';
  }
}

/**
 * Pure, deterministic calculation of Intervention Priority Score according to approved specification.
 * 
 * Formula:
 *   Priority Score = 0.40 * S_risk + 0.30 * S_loss + 0.20 * S_cluster + 0.10 * S_growth
 */
export function calculateInterventionPriority(input: InterventionPriorityInput): InterventionPriorityResult {
  const {
    farmId,
    farmLat,
    farmLng,
    riskPrediction,
    economicAnalysis,
    growthStage,
    activeClusters = [],
  } = input;

  // 1. Biological Risk Factor (0-100) - Weight 0.40
  const riskScore = Math.min(100, Math.max(0, Math.round(riskPrediction.risk_score)));
  const wRisk = 0.40;
  const impactRisk = Math.round(wRisk * riskScore);

  // 2. Economic Loss Exposure % (0-100) - Weight 0.30
  const grossValue = economicAnalysis.gross_crop_value || 0;
  const potentialLoss = economicAnalysis.potential_loss_without_action || 0;
  const lossPct = grossValue > 0
    ? Math.min(100, Math.max(0, Math.round((potentialLoss / grossValue) * 100)))
    : 0;
  const wLoss = 0.30;
  const impactLoss = Math.round(wLoss * lossPct);

  // 3. Outbreak Cluster Proximity (0-100) - Weight 0.20
  let clusterScore = 0;
  let clusterDescription = 'No active outbreak clusters within 10 km';

  if (activeClusters.length > 0) {
    let nearestCluster: OutbreakCluster | null = null;
    let minDistance = Infinity;

    for (const cluster of activeClusters) {
      const d = haversineKm(farmLat, farmLng, cluster.center.lat, cluster.center.lng);
      if (d < minDistance) {
        minDistance = d;
        nearestCluster = cluster;
      }
    }

    if (nearestCluster && minDistance <= 10) {
      let baseScore = 75; // stable default
      if (nearestCluster.growth_rate === 'accelerating') {
        baseScore = 100;
      } else if (nearestCluster.growth_rate === 'diminishing') {
        baseScore = 50;
      }

      if (minDistance <= nearestCluster.radius_km) {
        clusterScore = baseScore;
      } else {
        // Linear decay from cluster edge to 10 km boundary
        const distBeyondRadius = minDistance - nearestCluster.radius_km;
        const decaySpan = 10 - nearestCluster.radius_km;
        const decayRatio = decaySpan > 0 ? Math.max(0, 1 - (distBeyondRadius / decaySpan)) : 0;
        clusterScore = Math.round(baseScore * decayRatio);
      }

      clusterDescription = `${nearestCluster.disease_name} cluster (${nearestCluster.growth_rate}) at ${minDistance.toFixed(1)} km`;
    }
  }

  const wCluster = 0.20;
  const impactCluster = Math.round(wCluster * clusterScore);

  // 4. Crop Growth Susceptibility (0-100) - Weight 0.10
  const susceptibility = growthStage ? growthStage.susceptibility : 0.5;
  const growthScore = Math.min(100, Math.max(0, Math.round(susceptibility * 100)));
  const wGrowth = 0.10;
  const impactGrowth = Math.round(wGrowth * growthScore);

  // Weighted total score
  const totalScore = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        wRisk * riskScore +
        wLoss * lossPct +
        wCluster * clusterScore +
        wGrowth * growthScore
      )
    )
  );

  const tier = getInterventionPriorityTier(totalScore);
  const recommendedAction = getInterventionActionGuidance(tier);

  const factors: InterventionFactorDetail[] = [
    {
      name: 'Biological Risk Score',
      score: riskScore,
      weight: wRisk,
      impact: impactRisk,
      description: `${riskScore}/100 active threat level (${riskPrediction.risk_level || 'evaluated'})`,
    },
    {
      name: 'Crop Loss Exposure %',
      score: lossPct,
      weight: wLoss,
      impact: impactLoss,
      description: `₹${potentialLoss.toLocaleString('en-IN')} potential loss (${lossPct}% of total crop value)`,
    },
    {
      name: 'Outbreak Cluster Proximity',
      score: clusterScore,
      weight: wCluster,
      impact: impactCluster,
      description: clusterDescription,
    },
    {
      name: 'Growth Stage Susceptibility',
      score: growthScore,
      weight: wGrowth,
      impact: impactGrowth,
      description: growthStage
        ? `${growthStage.stage} stage (${growthScore}% phenological vulnerability)`
        : 'Standard seasonal vulnerability index (50%)',
    },
  ];

  return {
    farm_id: farmId,
    priority_score: totalScore,
    priority_tier: tier,
    recommended_action: recommendedAction,
    factors,
    economic_exposure_inr: potentialLoss,
    avoidable_loss_inr: economicAnalysis.avoided_loss || 0,
    net_benefit_inr: economicAnalysis.net_benefit || 0,
    evaluated_at: new Date().toISOString(),
  };
}

/**
 * Batch ranking utility for District Officers.
 * Sorts farms descending by priority_score.
 */
export function rankFarmsByInterventionPriority(items: InterventionPriorityInput[]): InterventionPriorityResult[] {
  return items
    .map(item => calculateInterventionPriority(item))
    .sort((a, b) => b.priority_score - a.priority_score);
}
