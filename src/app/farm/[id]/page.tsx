'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  Sprout, 
  Activity, 
  MapPin, 
  CloudRain, 
  ShieldAlert, 
  ArrowRight, 
  PlayCircle, 
  MessageSquare, 
  Map as MapIcon, 
  DollarSign,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ShieldCheck,
  Bug
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WeatherCard } from '@/components/farm/WeatherCard';
import { RiskFactorCard } from '@/components/farm/RiskFactorCard';
import { RecommendationBox } from '@/components/farm/RecommendationBox';
import { RiskForecastChart } from '@/components/risk/RiskForecastChart';
import { 
  Farm, 
  WeatherForecast, 
  Disease, 
  GrowthStage, 
  RiskPrediction, 
  Simulation, 
  EconomicAnalysis, 
  ActionRecommendation, 
  Diagnosis, 
  Alert 
} from '@/types';
import { formatINR } from '@/lib/utils';
import { CountUp } from '@/components/react-bits/CountUp';
import { Stepper, StepItem } from '@/components/react-bits/Stepper';
import { AnimatedList } from '@/components/react-bits/AnimatedList';
import { FadeContent } from '@/components/react-bits/FadeContent';
import { useTranslation } from '@/lib/context/LanguageContext';
import { getInitialFarmData } from '@/lib/services/farm-helper';

type TabKey = 'overview' | 'factors' | 'weather' | 'simulation' | 'history';

export default function FarmDetailPage() {
  const params = useParams();
  const farmId = params?.id as string;
  const router = useRouter();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [loading, setLoading] = useState(false);
  const [allFarms, setAllFarms] = useState<Farm[]>([]);
  const [selectedDiseaseId, setSelectedDiseaseId] = useState<string | null>(null);
  const [data, setData] = useState<{
    farm: Farm;
    latestDiagnosis?: Diagnosis;
    diagnoses: Diagnosis[];
    weather: WeatherForecast;
    disease: Disease;
    availableDiseases?: Disease[];
    growthStage?: GrowthStage;
    riskPrediction: RiskPrediction | null;
    simulation: Simulation | null;
    economicAnalysis: EconomicAnalysis | null;
    recommendation: ActionRecommendation | null;
    alerts: Alert[];
  } | null>(() => farmId ? (getInitialFarmData(farmId) as any) : null);

  useEffect(() => {
    fetchFarmsList();
  }, []);

  useEffect(() => {
    if (farmId) {
      const initial = getInitialFarmData(farmId, selectedDiseaseId || undefined);
      if (initial) {
        setData(initial);
        if (!selectedDiseaseId && initial.disease) {
          setSelectedDiseaseId(initial.disease.id);
        }
      }
      loadFarmData();
    }
  }, [farmId]);

  const fetchFarmsList = async () => {
    try {
      const res = await fetch('/api/farms');
      const json = await res.json();
      if (json.success) {
        setAllFarms(json.data);
      }
    } catch (e) {
      console.error('Error fetching farms list:', e);
    }
  };

  const loadFarmData = async (targetDiseaseId?: string) => {
    try {
      const queryDisease = targetDiseaseId || selectedDiseaseId;
      const url = queryDisease 
        ? `/api/farms/${farmId}?disease_id=${queryDisease}` 
        : `/api/farms/${farmId}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
        if (!selectedDiseaseId && json.data.disease) {
          setSelectedDiseaseId(json.data.disease.id);
        }
      }
    } catch (e) {
      console.error('Error fetching farm:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12 space-y-6">
        <div className="h-10 w-full bg-white rounded-2xl border border-[#E3E1D9] animate-pulse" />
        <div className="h-32 w-full bg-white rounded-2xl border border-[#E3E1D9] animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-44 bg-white rounded-2xl border border-[#E3E1D9] animate-pulse" />
          <div className="h-44 bg-white rounded-2xl border border-[#E3E1D9] animate-pulse" />
          <div className="h-44 bg-white rounded-2xl border border-[#E3E1D9] animate-pulse" />
        </div>
      </div>
    );
  }

  if (!data || !data.farm || !data.riskPrediction) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-[24px] font-normal text-[#14231C]">{t('Farm Not Found')}</h2>
        <p className="text-[14px] text-[#5C6259]">{t('The requested farm identifier does not exist.')}</p>
        <Link href="/">
          <Button variant="default">{t('Return to Home')}</Button>
        </Link>
      </div>
    );
  }

  const {
    farm,
    latestDiagnosis,
    diagnoses,
    weather,
    disease,
    availableDiseases = [],
    growthStage,
    riskPrediction,
    simulation,
    economicAnalysis,
    recommendation,
    alerts,
  } = data;

  const isDemo = farm.is_demo;
  const isCritical = riskPrediction.risk_score >= 75;

  const daysSinceSowing = Math.max(
    0,
    Math.floor((Date.now() - new Date(farm.sowing_date).getTime()) / (24 * 60 * 60 * 1000))
  );

  const stages = farm.crop?.growth_stages || [];
  const currentStageIndex = stages.findIndex(
    (st) => daysSinceSowing >= st.days_start && daysSinceSowing <= st.days_end
  );
  const activeStepIdx = currentStageIndex === -1 ? stages.length - 1 : currentStageIndex;

  const stepperItems: StepItem[] = stages.map((st) => ({
    title: t(st.stage),
    subtitle: `${t('Day')} ${st.days_start}–${st.days_end}`,
    meta: `${Math.round(st.susceptibility * 100)}% ${t('Vuln')}`,
  }));

  const tabs: { id: TabKey; label: string; badge?: string }[] = [
    { id: 'overview', label: t('Overview') },
    { id: 'factors', label: t('Risk Factors'), badge: `${riskPrediction.factors_json.length}` },
    { id: 'weather', label: t('Weather & Forecast'), badge: `${weather.current.humidity}% Hum` },
    { id: 'simulation', label: t('Simulation & Economics') },
    { id: 'history', label: t('History & Alerts'), badge: alerts.length > 0 ? `${alerts.length}` : undefined },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 space-y-6">
      
      {/* 1. ABOVE HEADING: DROPDOWNS TO CHOOSE MONITORED PLOT & TARGET THREAT (SIDE BY SIDE) */}
      <div className="flex items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-[20px] border border-[#E3E1D9]">
        <div className="flex items-center gap-3 sm:gap-5 flex-wrap">
          
          {/* Plot Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-[0.08em] text-[#5C6259] font-medium whitespace-nowrap">
              {t('Plot:')}
            </span>
            <select
              value={farm.id}
              onChange={(e) => {
                setSelectedDiseaseId(null);
                router.push(`/farm/${e.target.value}`);
              }}
              className="text-[13px] font-medium bg-[#F5F4F0] text-[#14231C] border border-[#E3E1D9] rounded-full px-3.5 py-1.5 focus:outline-none focus:border-[#14231C] cursor-pointer hover:bg-[#EAE8E2] transition-colors"
            >
              {allFarms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({t(f.crop?.name || f.crop_id)})
                </option>
              ))}
            </select>
          </div>

          {/* Threat / Pathogen Dropdown (Side by Side) */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-[0.08em] text-[#5C6259] font-medium whitespace-nowrap">
              {t('Threat:')}
            </span>
            <select
              value={disease.id}
              onChange={(e) => {
                const newId = e.target.value;
                setSelectedDiseaseId(newId);
                loadFarmData(newId);
              }}
              className="text-[13px] font-medium bg-[#F5F4F0] text-[#14231C] border border-[#E3E1D9] rounded-full px-3.5 py-1.5 focus:outline-none focus:border-[#14231C] cursor-pointer hover:bg-[#EAE8E2] transition-colors capitalize"
            >
              {(availableDiseases.length > 0 ? availableDiseases : [disease]).map((d) => (
                <option key={d.id} value={d.id}>
                  {t(d.name)} ({d.category})
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Telemetry Refresh Action */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => loadFarmData()} 
            title={t('Refresh Telemetry')} 
            className="w-8 h-8 rounded-full border border-[#E3E1D9] bg-[#F5F4F0] hover:bg-[#EAE8E2] flex items-center justify-center text-[#5C6259] hover:text-[#14231C] transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 2. MAIN HEADING: PLOT NAME & AGRONOMIC DETAILS */}
      <div className="rounded-[24px] border border-[#E3E1D9] bg-white p-6 sm:p-8 space-y-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-[26px] sm:text-[32px] font-normal tracking-tight text-[#14231C]">{farm.name}</h1>
          {isDemo && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F5F4F0] text-[#14231C] border border-[#E3E1D9]">
              {t('Demo Scenario')}
            </span>
          )}
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#1F3A2E] text-white">
            {t('Active Pathogen:')} {t(disease.name)}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-[#5C6259]">
          <span>{t('Crop:')} <strong className="text-[#14231C] font-medium">{t(farm.crop?.name || farm.crop_id)}</strong> ({farm.variety || 'Standard'})</span>
          <span>·</span>
          <span>{t('Area:')} <strong className="text-[#14231C] font-medium">{farm.area_acres} {t('Acres')}</strong></span>
          <span>·</span>
          <span>{t('Sown')} {farm.sowing_date} ({t('Day')} {daysSinceSowing})</span>
          <span>·</span>
          <span>{t('Location:')} {farm.lat.toFixed(3)}°N, {farm.lng.toFixed(3)}°E</span>
        </div>
      </div>

      {/* 3. MINIMAL TAB NAVIGATION STRIP */}
      <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-full border border-[#E3E1D9] overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-4 rounded-full text-[13px] transition-all whitespace-nowrap text-center ${
                isActive
                  ? 'bg-[#14231C] text-white font-medium shadow-none'
                  : 'text-[#5C6259] hover:text-[#14231C]'
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                {tab.label}
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#F5F4F0] text-[#5C6259]'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <FadeContent duration={0.3} className="space-y-6">
          {/* 3 Dominant Paper Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* 1. Risk Score */}
            <div className="rounded-[22px] border border-[#E3E1D9] bg-white p-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.08em] text-[#5C6259] font-medium">{t('1. Pathogen Risk')}</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                  isCritical ? 'bg-[#C13B3B] text-white' : 'bg-[#E3E1D9] text-[#5C6259]'
                }`}>
                  {t(riskPrediction.risk_level.toUpperCase())}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 pt-1">
                <span className={`text-[36px] font-semibold tracking-tight tabular-nums ${isCritical ? 'text-[#C13B3B]' : 'text-[#14231C]'}`}>
                  <CountUp to={riskPrediction.risk_score} duration={0.8} />
                </span>
                <span className="text-[14px] text-[#5C6259]">/ 100</span>
              </div>
              <p className="text-[13px] text-[#5C6259] truncate pt-1 border-t border-[#E3E1D9]">
                {t('Threat:')} <strong className="text-[#14231C] font-medium">{t(disease?.name || 'Pathogen')}</strong>
              </p>
            </div>

            {/* 2. Microclimate */}
            <div className="rounded-[22px] border border-[#E3E1D9] bg-white p-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.08em] text-[#5C6259] font-medium">{t('2. Humidity & Rain')}</span>
                <CloudRain className="h-4 w-4 text-[#5C6259]" />
              </div>
              <div className="flex items-baseline gap-1.5 pt-1">
                <span className="text-[36px] font-semibold tracking-tight text-[#14231C] tabular-nums">
                  <CountUp to={weather.current.humidity} duration={0.8} suffix="%" />
                </span>
                <span className="text-[14px] text-[#5C6259]">· {weather.current.temperature.toFixed(0)}°C</span>
              </div>
              <p className="text-[13px] text-[#5C6259] truncate pt-1 border-t border-[#E3E1D9]">
                {weather.current.rainfall} {t('mm rain')} · {weather.current.humidity >= 80 ? t('Spore Favorable') : t('Normal Conditions')}
              </p>
            </div>

            {/* 3. Avoidable Economic Loss */}
            <div className="rounded-[22px] border border-[#E3E1D9] bg-white p-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.08em] text-[#5C6259] font-medium">{t('3. Net Benefit of Acting')}</span>
                <DollarSign className="h-4 w-4 text-[#14231C]" />
              </div>
              <div className="flex items-baseline gap-1.5 pt-1">
                <span className="text-[36px] font-semibold tracking-tight text-[#14231C] tabular-nums">
                  <CountUp to={economicAnalysis?.net_benefit || 0} duration={1.0} prefix="₹" />
                </span>
              </div>
              <p className="text-[13px] text-[#5C6259] truncate pt-1 border-t border-[#E3E1D9]">
                {t('Protects yield · ROI:')} <span className="text-[#14231C] font-medium">{economicAnalysis?.roi_percentage || 0}%</span>
              </p>
            </div>
          </div>

          {/* Primary Action Box (Dusk Green Contrast Panel) */}
          {recommendation && <RecommendationBox recommendation={recommendation} />}

          {/* Stepper for Growth Lifecycle */}
          {farm.crop && (
            <div className="rounded-[22px] border border-[#E3E1D9] bg-white p-6 sm:p-7 space-y-5">
              <div className="flex items-center justify-between border-b border-[#E3E1D9] pb-4">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.08em] text-[#5C6259] font-medium mb-0.5">
                    {t('PHENOLOGICAL TIMING')}
                  </div>
                  <h3 className="text-[20px] font-normal text-[#14231C]">{t('Crop Growth Lifecycle')}</h3>
                </div>
                {growthStage && (
                  <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-[#F5F4F0] text-[#14231C] border border-[#E3E1D9]">
                    {t('Active:')} {t(growthStage.stage)}
                  </span>
                )}
              </div>

              <div className="pt-2">
                <Stepper steps={stepperItems} activeStep={activeStepIdx} />
              </div>
            </div>
          )}

          {/* Action Navigation Pill Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <Link href={`/diagnose?farm_id=${farm.id}`}>
              <button className="w-full rounded-full border border-[#E3E1D9] bg-white text-[#14231C] hover:bg-[#F5F4F0] p-3 text-[13px] font-medium transition-colors flex items-center justify-center gap-2">
                <Activity className="h-3.5 w-3.5 text-[#14231C]" />
                <span>{t('AI Diagnosis')}</span>
              </button>
            </Link>
            <Link href={`/map?lat=${farm.lat}&lng=${farm.lng}&farm_id=${farm.id}`}>
              <button className="w-full rounded-full border border-[#E3E1D9] bg-white text-[#14231C] hover:bg-[#F5F4F0] p-3 text-[13px] font-medium transition-colors flex items-center justify-center gap-2">
                <MapIcon className="h-3.5 w-3.5 text-[#14231C]" />
                <span>{t('Outbreak Map')}</span>
              </button>
            </Link>
            <Link href={`/simulate?farm_id=${farm.id}`}>
              <button className="w-full rounded-full border border-[#E3E1D9] bg-white text-[#14231C] hover:bg-[#F5F4F0] p-3 text-[13px] font-medium transition-colors flex items-center justify-center gap-2">
                <PlayCircle className="h-3.5 w-3.5 text-[#14231C]" />
                <span>{t('Spread Simulator')}</span>
              </button>
            </Link>
            <Link href={`/assistant?farm_id=${farm.id}`}>
              <button className="w-full rounded-full border border-[#E3E1D9] bg-white text-[#14231C] hover:bg-[#F5F4F0] p-3 text-[13px] font-medium transition-colors flex items-center justify-center gap-2">
                <MessageSquare className="h-3.5 w-3.5 text-[#14231C]" />
                <span>{t('AI Advisor')}</span>
              </button>
            </Link>
          </div>
        </FadeContent>
      )}

      {/* TAB 2: RISK FACTORS */}
      {activeTab === 'factors' && (
        <FadeContent duration={0.3} className="space-y-6">
          <RiskFactorCard prediction={riskPrediction} />
        </FadeContent>
      )}

      {/* TAB 3: WEATHER & 7-DAY TRAJECTORY */}
      {activeTab === 'weather' && (
        <FadeContent duration={0.3} className="space-y-6">
          <WeatherCard weather={weather} />
          {riskPrediction.forecast_json && riskPrediction.forecast_json.length > 0 && (
            <RiskForecastChart forecast={riskPrediction.forecast_json} />
          )}
        </FadeContent>
      )}

      {/* TAB 4: SIMULATION & ECONOMICS */}
      {activeTab === 'simulation' && (
        <FadeContent duration={0.3} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Simulation Preview */}
            <div className="rounded-[22px] border border-[#E3E1D9] bg-white p-7 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#E3E1D9] pb-3">
                  <h3 className="text-[18px] font-normal text-[#14231C]">{t('Spread Simulator')}</h3>
                  <span className="text-[11px] text-[#5C6259]">{t('Graph Contagion Simulation')}</span>
                </div>
                <p className="text-[13px] text-[#5C6259] mt-3">
                  {t('Comparing unchecked pathogen propagation against immediate bio-control containment:')}
                </p>

                <div className="grid grid-cols-2 gap-3 text-[13px] mt-4">
                  <div className="p-4 bg-[#F5F4F0] rounded-xl border border-[#E3E1D9] space-y-1">
                    <span className="text-[11px] text-[#C13B3B] font-medium block uppercase">{t('No Action')}</span>
                    <span className="text-[20px] font-semibold text-[#14231C] tabular-nums block">
                      {simulation?.scenarios.no_action.affected_area_percent}% {t('Area:')}
                    </span>
                    <span className="text-[11px] text-[#5C6259] block">
                      {t('Estimated Harvest Loss')}: {formatINR(simulation?.scenarios.no_action.estimated_loss || 0)}
                    </span>
                  </div>
                  <div className="p-4 bg-[#F5F4F0] rounded-xl border border-[#E3E1D9] space-y-1">
                    <span className="text-[11px] text-[#2F9E5C] font-medium block uppercase">{t('Intervene Today')}</span>
                    <span className="text-[20px] font-semibold text-[#14231C] tabular-nums block">
                      {simulation?.scenarios.intervene_today.affected_area_percent}% {t('Area:')}
                    </span>
                    <span className="text-[11px] text-[#5C6259] block">
                      {t('Estimated Harvest Loss')}: {formatINR(simulation?.scenarios.intervene_today.estimated_loss || 0)}
                    </span>
                  </div>
                </div>
              </div>

              <Link href={`/simulate?farm_id=${farm.id}`}>
                <button className="w-full rounded-full bg-[#14231C] text-white hover:bg-[#23372E] py-2.5 text-[13px] font-medium transition-all flex items-center justify-center gap-1.5 group">
                  <span>{t('Open Full Scenario Comparison')}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </Link>
            </div>

            {/* Economic Impact */}
            <div className="rounded-[22px] border border-[#E3E1D9] bg-white p-7 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#E3E1D9] pb-3">
                  <h3 className="text-[18px] font-normal text-[#14231C]">{t('MSP Economic Loss Model')}</h3>
                  <span className="text-[11px] text-[#5C6259]">{t('MSP Baseline')}</span>
                </div>

                <div className="space-y-2.5 text-[13px] mt-4">
                  <div className="flex justify-between py-1 border-b border-[#E3E1D9]">
                    <span className="text-[#5C6259]">{t('Gross Harvest Value')} ({farm.area_acres} {t('Acres')}):</span>
                    <strong className="text-[#14231C] font-medium tabular-nums">{formatINR(economicAnalysis?.gross_crop_value || 0)}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#E3E1D9] text-[#C13B3B]">
                    <span>{t('Potential Loss (No Action):')}</span>
                    <span className="font-medium tabular-nums">-{formatINR(economicAnalysis?.potential_loss_without_action || 0)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#E3E1D9] text-[#2F9E5C]">
                    <span>{t('Avoided Loss with Bio-Control:')}</span>
                    <span className="font-medium tabular-nums">+{formatINR(economicAnalysis?.avoided_loss || 0)}</span>
                  </div>
                  <div className="flex justify-between py-2 text-[#14231C] font-medium bg-[#F5F4F0] p-3 rounded-xl border border-[#E3E1D9]">
                    <span>{t('Projected Net Benefit:')}</span>
                    <span className="font-semibold tabular-nums">{formatINR(economicAnalysis?.net_benefit || 0)}</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-[#5C6259]">
                {t(economicAnalysis?.disclaimer || '')}
              </p>
            </div>
          </div>
        </FadeContent>
      )}

      {/* TAB 5: HISTORY & ALERTS */}
      {activeTab === 'history' && (
        <FadeContent duration={0.3} className="space-y-6">
          {/* Active Alerts */}
          <div className="rounded-[22px] border border-[#E3E1D9] bg-white p-7 space-y-4">
            <h3 className="text-[18px] font-normal text-[#14231C]">{t('History & Alerts')}</h3>
            {alerts.length === 0 ? (
              <p className="text-[13px] text-[#5C6259] italic">{t('No unread alerts for this plot.')}</p>
            ) : (
              <div className="space-y-2.5">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-xl border text-[13px] flex items-start gap-3 ${
                      alert.severity === 'critical'
                        ? 'border-[#C13B3B]/30 bg-white text-[#14231C]'
                        : 'border-[#E3E1D9] bg-[#F5F4F0] text-[#14231C]'
                    }`}
                  >
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-[#C13B3B]" />
                    <div>
                      <strong className="block font-medium">{t(alert.title)}</strong>
                      <p className="text-[12px] text-[#5C6259] mt-0.5">{t(alert.message)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Diagnosis History */}
          <div className="rounded-[22px] border border-[#E3E1D9] bg-white p-7 space-y-4">
            <h3 className="text-[18px] font-normal text-[#14231C]">{t('Diagnosis History')}</h3>
            {diagnoses.length === 0 ? (
              <p className="text-[13px] text-[#5C6259] italic">{t('No past diagnoses recorded.')}</p>
            ) : (
              <div className="space-y-2.5">
                {diagnoses.map((diag) => (
                  <div key={diag.id} className="p-3.5 rounded-xl border border-[#E3E1D9] bg-white flex items-center justify-between text-[13px]">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg overflow-hidden bg-[#F5F4F0] shrink-0 border border-[#E3E1D9]">
                        <img src={diag.image_url} alt="Leaf" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <strong className="block font-medium text-[#14231C] capitalize">
                          {t(diag.disease?.name || diag.disease_id?.replace(/_/g, ' '))}
                        </strong>
                        <span className="text-[11px] text-[#5C6259]">
                          {new Date(diag.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })} · {t('Confidence')} {Math.round(diag.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F5F4F0] text-[#14231C] border border-[#E3E1D9]">
                      {t(diag.severity.toUpperCase())}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </FadeContent>
      )}

    </div>
  );
}
