'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { DiseaseReport, OutbreakCluster, Farm } from '@/types';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, MapPin, Activity, Info } from 'lucide-react';

// Dynamically import react-leaflet components with ssr: false
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);
const Circle = dynamic(
  () => import('react-leaflet').then((mod) => mod.Circle),
  { ssr: false }
);

interface DiseaseMapProps {
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  farms?: Farm[];
  reports?: DiseaseReport[];
  clusters?: OutbreakCluster[];
  selectedFarmId?: string;
}

export function DiseaseMap({
  centerLat = 20.4625,
  centerLng = 85.8828,
  zoom = 12,
  farms = [],
  reports = [],
  clusters = [],
  selectedFarmId,
}: DiseaseMapProps) {
  const [leafletReady, setLeafletReady] = useState(false);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    import('leaflet').then((leaflet) => {
      setL(leaflet.default || leaflet);
      setLeafletReady(true);
    });
  }, []);

  if (!leafletReady || !L) {
    return (
      <div className="h-[550px] w-full bg-slate-100 rounded-xl flex items-center justify-center text-xs text-slate-500 animate-pulse">
        Initializing Geospatial Map Layer...
      </div>
    );
  }

  // Custom Icon Helpers
  const createFarmIcon = (isPrimary: boolean) => {
    return L.divIcon({
      className: 'custom-farm-marker',
      html: `<div style="background-color: ${isPrimary ? '#047857' : '#059669'}; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); font-size: 14px;">🌱</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  };

  const createReportIcon = (severity: string) => {
    let color = '#d97706'; // amber
    if (severity === 'critical') color = '#dc2626'; // red
    if (severity === 'high') color = '#ea580c'; // orange
    if (severity === 'low') color = '#10b981'; // green

    return L.divIcon({
      className: 'custom-report-marker',
      html: `<div style="background-color: ${color}; width: 18px; height: 18px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });
  };

  return (
    <div className="h-[420px] sm:h-[550px] w-full rounded-2xl overflow-hidden border border-[#E3E1D9] relative">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={zoom}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 1. Outbreak Clusters Layer */}
        {clusters.map((cluster) => {
          const radiusMeters = cluster.radius_km * 1000;
          return (
            <Circle
              key={cluster.cluster_id}
              center={[cluster.center.lat, cluster.center.lng]}
              radius={radiusMeters}
              pathOptions={{
                color: cluster.risk_level === 'critical' ? '#dc2626' : '#ea580c',
                fillColor: cluster.risk_level === 'critical' ? '#ef4444' : '#f97316',
                fillOpacity: 0.18,
                weight: 2,
                dashArray: '4, 4',
              }}
            >
              <Popup>
                <div className="p-1 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-rose-700">
                    <ShieldAlert className="h-4 w-4" />
                    <span>Outbreak Cluster ({cluster.risk_level.toUpperCase()})</span>
                  </div>
                  <p className="text-slate-800 font-semibold">{cluster.disease_name}</p>
                  <p className="text-slate-600">
                    <strong>{cluster.report_count} Reports</strong> clustered within {cluster.radius_km} km
                  </p>
                  <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">
                    Trajectory: {cluster.growth_rate.toUpperCase()}
                  </span>
                </div>
              </Popup>
            </Circle>
          );
        })}

        {/* 2. Disease Reports Layer */}
        {reports.map((report) => (
          <Marker
            key={report.id}
            position={[report.lat, report.lng]}
            icon={createReportIcon(report.severity)}
          >
            <Popup>
              <div className="p-1 space-y-1.5 text-xs max-w-[220px]">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-900 capitalize font-bold">
                    {report.disease?.name || report.disease_id.replace(/_/g, ' ')}
                  </strong>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                    report.severity === 'critical' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {report.severity}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Confidence: <strong>{Math.round(report.confidence * 100)}%</strong>
                </p>
                <p className="text-[10px] text-slate-400">
                  Reported: {new Date(report.reported_at).toLocaleDateString('en-IN')}
                </p>
                {report.is_simulated && (
                  <span className="text-[9px] text-slate-400 italic block">
                    * Simulated regional surveillance data
                  </span>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 3. Farms Layer */}
        {farms.map((farm) => {
          const isPrimary = farm.id === selectedFarmId || farm.is_demo;
          return (
            <Marker
              key={farm.id}
              position={[farm.lat, farm.lng]}
              icon={createFarmIcon(Boolean(isPrimary))}
            >
              <Popup>
                <div className="p-1 space-y-1 text-xs">
                  <div className="flex items-center gap-1 text-emerald-800 font-bold">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{farm.name}</span>
                  </div>
                  <p className="text-slate-600">
                    {farm.crop?.name || farm.crop_id} · {farm.area_acres} Acres
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Sowing: {farm.sowing_date}
                  </p>
                  {isPrimary && (
                    <span className="inline-block text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold">
                      Your Active Farm
                    </span>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur p-3 rounded-lg shadow-lg border border-slate-200 text-xs space-y-2 max-w-xs">
        <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">Map Legend</span>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-emerald-700 inline-block" />
            <span>Monitored Farm</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-rose-600 inline-block" />
            <span>Critical Disease Case</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-orange-500 inline-block" />
            <span>High/Moderate Case</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded border border-rose-500 bg-rose-100/60 inline-block" />
            <span>DBSCAN Outbreak Zone</span>
          </div>
        </div>
      </div>
    </div>
  );
}
