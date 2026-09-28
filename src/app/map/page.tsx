'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { DiseaseMap } from '@/components/map/DiseaseMap';
import { Button } from '@/components/ui/button';
import { 
  Map as MapIcon, 
  ShieldAlert, 
  RefreshCw
} from 'lucide-react';
import { Farm, DiseaseReport, OutbreakCluster, Disease } from '@/types';
import { DEMO_FARM_ID } from '@/lib/seeds/demo-farms';
import { CountUp } from '@/components/react-bits/CountUp';
import { useTranslation } from '@/lib/context/LanguageContext';

import { mockDb } from '@/lib/supabase/mock-db';

function MapViewContent() {
  const searchParams = useSearchParams();
  const initialFarmId = searchParams.get('farm_id') || DEMO_FARM_ID;
  const { t } = useTranslation();

  const [farms, setFarms] = useState<Farm[]>(() => mockDb.getFarms());
  const [reports, setReports] = useState<DiseaseReport[]>(() => mockDb.getDiseaseReports());
  const [clusters, setClusters] = useState<OutbreakCluster[]>([]);
  const [diseases, setDiseases] = useState<Disease[]>(() => mockDb.getDiseases());
  const [selectedDisease, setSelectedDisease] = useState<string>('all');
  const [selectedRadius, setSelectedRadius] = useState<number>(25);
  const [selectedFarmId, setSelectedFarmId] = useState<string>(initialFarmId);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMapData();
  }, [selectedDisease, selectedRadius, selectedFarmId]);

  const loadMapData = async () => {
    setLoading(true);
    try {
      const [farmRes, disRes, repRes, outRes] = await Promise.all([
        fetch('/api/farms'),
        fetch('/api/diseases'),
        fetch(`/api/reports/nearby?radius=${selectedRadius}${selectedDisease !== 'all' ? `&disease=${selectedDisease}` : ''}`),
        fetch('/api/outbreaks'),
      ]);

      const [farmJson, disJson, repJson, outJson] = await Promise.all([
        farmRes.json(),
        disRes.json(),
        repRes.json(),
        outRes.json(),
      ]);

      if (farmJson.success) setFarms(farmJson.data);
      if (disJson.success) setDiseases(disJson.data);
      if (repJson.success) setReports(repJson.data);
      if (outJson.success) setClusters(outJson.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const currentFarm = farms.find(f => f.id === selectedFarmId) || farms[0];
  const centerLat = currentFarm ? currentFarm.lat : 20.4625;
  const centerLng = currentFarm ? currentFarm.lng : 85.8828;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E3E1D9] pb-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.08em] text-[#5C6259] font-medium mb-1">
            {t('GEOSPATIAL SURVEILLANCE RADAR')}
          </div>
          <h1 className="text-[28px] sm:text-[32px] font-normal text-[#14231C] tracking-tight">
            {t('Regional Outbreak Radar')}
          </h1>
        </div>

        <button
          onClick={loadMapData}
          className="inline-flex items-center rounded-full bg-white border border-[#E3E1D9] text-[#14231C] hover:bg-[#F5F4F0] px-4 py-2 text-[13px] font-medium transition-all"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 text-[#5C6259] ${loading ? 'animate-spin' : ''}`} />
          {t('Refresh Radar')}
        </button>
      </div>

      {/* Filter Strip */}
      <div className="rounded-[22px] border border-[#E3E1D9] bg-white p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-[13px]">
          <div>
            <label className="font-medium text-[#14231C] block mb-1.5">{t('Center on Farm')}</label>
            <select
              value={selectedFarmId}
              onChange={(e) => setSelectedFarmId(e.target.value)}
              className="w-full px-3.5 py-2 border border-[#E3E1D9] rounded-xl bg-[#F5F4F0] font-medium text-[#14231C] focus:outline-none focus:border-[#14231C]"
            >
              {farms.map(f => (
                <option key={f.id} value={f.id}>{f.name} ({t(f.crop?.name || f.crop_id)})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-medium text-[#14231C] block mb-1.5">{t('Filter Pathogen')}</label>
            <select
              value={selectedDisease}
              onChange={(e) => setSelectedDisease(e.target.value)}
              className="w-full px-3.5 py-2 border border-[#E3E1D9] rounded-xl bg-[#F5F4F0] font-medium text-[#14231C] focus:outline-none focus:border-[#14231C]"
            >
              <option value="all">{t('All Pathogens (Full Radar)')}</option>
              {diseases.map(d => (
                <option key={d.id} value={d.id}>{t(d.name)}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between font-medium text-[#14231C] mb-1.5">
              <span>{t('Radius Window')}</span>
              <span className="tabular-nums">{selectedRadius} km</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={selectedRadius}
              onChange={(e) => setSelectedRadius(parseInt(e.target.value))}
              className="w-full h-1.5 bg-[#E3E1D9] rounded-lg appearance-none cursor-pointer accent-[#14231C] mt-2"
            />
          </div>
        </div>
      </div>

      {/* Main Map View */}
      <div className="rounded-[24px] overflow-hidden border border-[#E3E1D9] bg-white">
        <DiseaseMap
          centerLat={centerLat}
          centerLng={centerLng}
          zoom={12}
          farms={farms}
          reports={reports}
          clusters={clusters}
          selectedFarmId={selectedFarmId}
        />
      </div>

      {/* Detected Outbreak Clusters */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between border-b border-[#E3E1D9] pb-3">
          <div>
            <span className="text-[11px] uppercase tracking-[0.08em] text-[#5C6259] font-medium block">
              {t('DBSCAN SPATIAL-TEMPORAL CLUSTERING')}
            </span>
            <h3 className="text-[20px] font-normal text-[#14231C] mt-0.5">
              {t('Active Outbreak Clusters')} ({clusters.length})
            </h3>
          </div>
          <span className="text-[12px] text-[#5C6259]">Rule: &ge;3 cases · &le;5km · &le;7 days</span>
        </div>

        {clusters.length === 0 ? (
          <p className="text-[13px] text-[#5C6259] italic p-6 bg-white rounded-[22px] border border-[#E3E1D9]">
            {t('No active outbreak clusters detected within the current surveillance window.')}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {clusters.map((cluster) => (
              <div
                key={cluster.cluster_id}
                className="rounded-[22px] border border-[#E3E1D9] bg-white p-7 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-medium text-[#5C6259] uppercase tracking-wider block">
                      {t('Cluster')} {cluster.cluster_id}
                    </span>
                    <h4 className="text-[18px] font-normal text-[#14231C] mt-0.5">
                      {t(cluster.disease_name)}
                    </h4>
                  </div>
                  <span className="px-3 py-0.5 rounded-full text-[11px] font-medium bg-[#C13B3B] text-white">
                    {t(cluster.risk_level.toUpperCase())}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center text-[13px]">
                  <div className="bg-[#F5F4F0] p-3 rounded-xl border border-[#E3E1D9]">
                    <span className="text-[10px] text-[#5C6259] block uppercase">{t('Reports')}</span>
                    <strong className="text-[18px] font-semibold text-[#14231C] tabular-nums">
                      <CountUp to={cluster.report_count} duration={0.8} />
                    </strong>
                  </div>
                  <div className="bg-[#F5F4F0] p-3 rounded-xl border border-[#E3E1D9]">
                    <span className="text-[10px] text-[#5C6259] block uppercase">{t('Radius')}</span>
                    <strong className="text-[18px] font-semibold text-[#14231C] tabular-nums">{cluster.radius_km} km</strong>
                  </div>
                  <div className="bg-[#F5F4F0] p-3 rounded-xl border border-[#E3E1D9]">
                    <span className="text-[10px] text-[#5C6259] block uppercase">{t('Spread')}</span>
                    <strong className="text-[13px] font-semibold text-[#C13B3B] uppercase mt-1 block">{cluster.growth_rate}</strong>
                  </div>
                </div>

                <div className="text-[12px] text-[#5C6259] flex items-center justify-between pt-2 border-t border-[#E3E1D9]">
                  <span>{t('Centroid:')} {cluster.center.lat.toFixed(3)}, {cluster.center.lng.toFixed(3)}</span>
                  <span className="text-[#C13B3B] font-medium">{t('Acute Area Threat')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MapPage() {
  const { t } = useTranslation();
  return (
    <Suspense fallback={<div className="max-w-5xl mx-auto p-12 text-center text-[13px] text-[#5C6259]">{t('Loading surveillance radar...')}</div>}>
      <MapViewContent />
    </Suspense>
  );
}
