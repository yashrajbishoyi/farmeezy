import { DiseaseReport, OutbreakCluster, SeverityLevel } from '@/types';

export interface OutbreakDetectionConfig {
  minReports: number; // default 3
  maxDistanceKm: number; // default 5.0 km
  maxTimeDiffDays: number; // default 7 days
}

export const DEFAULT_OUTBREAK_CONFIG: OutbreakDetectionConfig = {
  minReports: 3,
  maxDistanceKm: 5.0,
  maxTimeDiffDays: 7,
};

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
 * DBSCAN-style outbreak cluster detector per PRD §10.
 */
export function detectOutbreaks(
  reports: DiseaseReport[],
  config: Partial<OutbreakDetectionConfig> = {}
): OutbreakCluster[] {
  const { minReports, maxDistanceKm, maxTimeDiffDays } = {
    ...DEFAULT_OUTBREAK_CONFIG,
    ...config,
  };

  const now = Date.now();
  const maxTimeMs = maxTimeDiffDays * 24 * 60 * 60 * 1000;

  // Filter reports within recent window
  const activeReports = reports.filter(r => {
    const reportTime = new Date(r.reported_at).getTime();
    return now - reportTime <= maxTimeMs;
  });

  // Group by disease_id
  const byDisease = new Map<string, DiseaseReport[]>();
  activeReports.forEach(r => {
    const list = byDisease.get(r.disease_id) || [];
    list.push(r);
    byDisease.set(r.disease_id, list);
  });

  const clusters: OutbreakCluster[] = [];

  byDisease.forEach((diseaseReports, diseaseId) => {
    if (diseaseReports.length < minReports) return;

    const visited = new Set<string>();
    let clusterIdx = 1;

    for (let i = 0; i < diseaseReports.length; i++) {
      const core = diseaseReports[i];
      if (visited.has(core.id)) continue;

      // Find all neighbors within maxDistanceKm
      const neighbors = diseaseReports.filter(other => {
        const dist = haversineKm(core.lat, core.lng, other.lat, other.lng);
        return dist <= maxDistanceKm;
      });

      if (neighbors.length >= minReports) {
        // Expand cluster
        const clusterMembers: DiseaseReport[] = [];
        const queue = [...neighbors];

        queue.forEach(n => visited.add(n.id));

        while (queue.length > 0) {
          const current = queue.shift()!;
          clusterMembers.push(current);

          const subNeighbors = diseaseReports.filter(other => {
            if (visited.has(other.id)) return false;
            const dist = haversineKm(current.lat, current.lng, other.lat, other.lng);
            return dist <= maxDistanceKm;
          });

          if (subNeighbors.length >= minReports) {
            subNeighbors.forEach(sn => {
              visited.add(sn.id);
              queue.push(sn);
            });
          }
        }

        // Calculate cluster center (centroid) and radius
        const avgLat = clusterMembers.reduce((sum, r) => sum + r.lat, 0) / clusterMembers.length;
        const avgLng = clusterMembers.reduce((sum, r) => sum + r.lng, 0) / clusterMembers.length;

        let maxRadius = 0.5;
        clusterMembers.forEach(r => {
          const d = haversineKm(avgLat, avgLng, r.lat, r.lng);
          if (d > maxRadius) maxRadius = d;
        });

        // Determine severity level based on critical/high count
        const criticalCount = clusterMembers.filter(r => r.severity === 'critical').length;
        const highCount = clusterMembers.filter(r => r.severity === 'high').length;
        let riskLevel: SeverityLevel = 'moderate';
        if (criticalCount >= 2 || clusterMembers.length >= 8) {
          riskLevel = 'critical';
        } else if (highCount >= 2 || clusterMembers.length >= 4) {
          riskLevel = 'high';
        }

        // Growth rate: compare reports in last 3 days vs 4-7 days
        const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
        const recentCount = clusterMembers.filter(r => now - new Date(r.reported_at).getTime() <= threeDaysMs).length;
        const olderCount = clusterMembers.length - recentCount;

        let growthRate: 'accelerating' | 'stable' | 'diminishing' = 'stable';
        if (recentCount > olderCount * 1.5) growthRate = 'accelerating';
        else if (recentCount < olderCount * 0.5) growthRate = 'diminishing';

        const diseaseName = clusterMembers[0].disease?.name || diseaseId.replace(/_/g, ' ');

        clusters.push({
          cluster_id: `cluster-${diseaseId}-${clusterIdx++}`,
          center: { lat: avgLat, lng: avgLng },
          radius_km: Number(maxRadius.toFixed(2)),
          report_count: clusterMembers.length,
          risk_level: riskLevel,
          disease_id: diseaseId,
          disease_name: diseaseName,
          growth_rate: growthRate,
          reports: clusterMembers,
        });
      }
    }
  });

  return clusters;
}
