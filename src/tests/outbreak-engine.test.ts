import { describe, it, expect } from 'vitest';
import { detectOutbreaks } from '../lib/engines/outbreak-engine';
import { SEED_DISEASE_REPORTS } from '../lib/seeds/demo-farms';

describe('Outbreak Engine (DBSCAN Clustering PRD §10)', () => {
  it('identifies the Rice Blast outbreak cluster around Cuttack with >= 3 reports in 5km', () => {
    const clusters = detectOutbreaks(SEED_DISEASE_REPORTS);

    expect(clusters.length).toBeGreaterThanOrEqual(1);

    const blastCluster = clusters.find(c => c.disease_id === 'rice_blast');
    expect(blastCluster).toBeDefined();
    expect(blastCluster!.report_count).toBeGreaterThanOrEqual(10);
    expect(blastCluster!.radius_km).toBeLessThanOrEqual(5.5);
    expect(blastCluster!.risk_level).toBe('critical');
    expect(blastCluster!.center.lat).toBeCloseTo(20.46, 1);
    expect(blastCluster!.center.lng).toBeCloseTo(85.88, 1);
  });

  it('ignores isolated reports that do not meet minReports threshold', () => {
    const isolatedReports = [
      {
        id: 'isolated-1',
        disease_id: 'wheat_yellow_rust',
        lat: 28.61,
        lng: 77.20,
        confidence: 0.9,
        severity: 'high' as const,
        reported_at: new Date().toISOString(),
        verified: true,
      },
    ];

    const clusters = detectOutbreaks(isolatedReports);
    expect(clusters).toHaveLength(0);
  });
});
