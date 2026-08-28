'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { 
  PlayCircle, 
  Sliders,
  ArrowRight,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Hourglass
} from 'lucide-react';
import { Farm, Simulation } from '@/types';
import { DEMO_FARM_ID } from '@/lib/seeds/demo-farms';
import { formatINR } from '@/lib/utils';
import { CountUp } from '@/components/react-bits/CountUp';
import { useTranslation } from '@/lib/context/LanguageContext';

function SimulateContent() {
  const searchParams = useSearchParams();
  const initialFarmId = searchParams.get('farm_id') || DEMO_FARM_ID;
  const { t } = useTranslation();

  const [farms, setFarms] = useState<Farm[]>([]);
  const [diseases, setDiseases] = useState<any[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string>(initialFarmId);
  const [selectedDiseaseId, setSelectedDiseaseId] = useState<string>('rice_blast');
  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const [activeScenario, setActiveScenario] = useState<'no_action' | 'intervene_today' | 'intervene_day3'>('no_action');
  const [delayDays, setDelayDays] = useState<number>(3);
  const [loading, setLoading] = useState(true);

  const [propagationFactor, setPropagationFactor] = useState(0.18);
  const [weatherModifier, setWeatherModifier] = useState(1.15);

  useEffect(() => {
    fetchFarmsAndDiseases();
  }, []);

  useEffect(() => {
    if (selectedFarmId) {
      runSimulation();
    }
  }, [selectedFarmId, selectedDiseaseId, propagationFactor, weatherModifier, delayDays]);

  const fetchFarmsAndDiseases = async () => {
    try {
      const [farmRes, disRes] = await Promise.all([
        fetch('/api/farms'),
        fetch('/api/diseases'),
      ]);
      const [farmData, disData] = await Promise.all([
        farmRes.json(),
        disRes.json(),
      ]);
      if (farmData.success) setFarms(farmData.data);
      if (disData.success) setDiseases(disData.data);
    } catch (e) {
      console.error(e);
    }
  };

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farm_id: selectedFarmId,
          disease_id: selectedDiseaseId,
          initial_risk_score: 81,
          propagation_factor: propagationFactor,
          weather_modifier: weatherModifier,
          delay_days: delayDays,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSimulation(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const chartData = [0, 3, 7, 14].map((day, idx) => ({
    day: `Day ${day}`,
    scenarioA: simulation?.scenarios.no_action.affected_area_curve[idx] || 0,
    scenarioB: simulation?.scenarios.intervene_today.affected_area_curve[idx] || 0,
    scenarioC: simulation?.scenarios.intervene_after_3_days.affected_area_curve[idx] || 0,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#14231C] text-white p-3 rounded-xl shadow-md text-[12px] space-y-1 border border-[#23372E]">
          <p className="font-medium text-[#F5F4F0]">{label}</p>
          {payload.map((entry: any, i: number) => (
            <p key={i} style={{ color: entry.color }} className="font-semibold">
              {entry.name}: {entry.value}% area infected
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E3E1D9] pb-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.08em] text-[#5C6259] font-medium mb-1">
            {t('EPIDEMIOLOGICAL SPREAD MODEL')}
          </div>
          <h1 className="text-[28px] sm:text-[32px] font-normal text-[#14231C] tracking-tight">
            {t('Contagion Propagation & Scenarios')}
          </h1>
        </div>

        {/* Stacked Dropdowns: Threat slightly above Target Plot */}
        <div className="flex flex-col sm:items-end gap-2 text-[13px]">
          {/* Threat Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-[0.08em] text-[#5C6259] font-medium whitespace-nowrap">
              {t('Threat:')}
            </span>
            <select
              value={selectedDiseaseId}
              onChange={(e) => setSelectedDiseaseId(e.target.value)}
              className="px-3 py-1 border border-[#E3E1D9] rounded-full text-[12px] font-medium bg-[#F5F4F0] text-[#14231C] focus:outline-none focus:border-[#14231C] capitalize cursor-pointer hover:bg-[#EAE8E2] transition-colors"
            >
              {diseases.map((d) => (
                <option key={d.id} value={d.id}>
                  {t(d.name)} ({d.category})
                </option>
              ))}
            </select>
          </div>

          {/* Target Plot Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-[0.08em] text-[#5C6259] font-medium whitespace-nowrap">
              {t('Plot:')}
            </span>
            <select
              value={selectedFarmId}
              onChange={(e) => setSelectedFarmId(e.target.value)}
              className="px-3 py-1 border border-[#E3E1D9] rounded-full text-[12px] font-medium bg-white text-[#14231C] focus:outline-none focus:border-[#14231C] cursor-pointer hover:bg-[#F5F4F0] transition-colors"
            >
              {farms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({t(f.crop?.name || f.crop_id)})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Scenario Switcher Pill Bar */}
      <div className="flex items-center gap-2 bg-white p-1.5 rounded-full border border-[#E3E1D9] overflow-x-auto no-scrollbar">
        {/* Scenario A */}
        <button
          onClick={() => setActiveScenario('no_action')}
          className={`flex-1 py-2 px-4 rounded-full text-[13px] transition-all whitespace-nowrap text-center ${
            activeScenario === 'no_action'
              ? 'bg-[#14231C] text-white font-medium shadow-none'
              : 'text-[#5C6259] hover:text-[#14231C]'
          }`}
        >
          {t('Scenario A: No Action (Worst Case)')}
        </button>

        {/* Scenario B */}
        <button
          onClick={() => setActiveScenario('intervene_today')}
          className={`flex-1 py-2 px-4 rounded-full text-[13px] transition-all whitespace-nowrap text-center ${
            activeScenario === 'intervene_today'
              ? 'bg-[#14231C] text-white font-medium shadow-none'
              : 'text-[#5C6259] hover:text-[#14231C]'
          }`}
        >
          {t('Scenario B: Intervene Today (Day 0)')}
        </button>

        {/* Scenario C */}
        <button
          onClick={() => setActiveScenario('intervene_day3')}
          className={`flex-1 py-2 px-4 rounded-full text-[13px] transition-all whitespace-nowrap text-center ${
            activeScenario === 'intervene_day3'
              ? 'bg-[#14231C] text-white font-medium shadow-none'
              : 'text-[#5C6259] hover:text-[#14231C]'
          }`}
        >
          {t('Scenario C: Intervene After')} {delayDays} {t('Day')}s
        </button>
      </div>

      {/* 1. SCENARIO A: NO ACTION */}
      {activeScenario === 'no_action' && (
        <div className="rounded-[22px] border border-[#E3E1D9] bg-white p-6 sm:p-8 space-y-6">
          <div className="flex items-start justify-between border-b border-[#E3E1D9] pb-4">
            <div>
              <span className="text-[11px] uppercase tracking-[0.08em] text-[#C13B3B] font-medium block">
                {t('UNCHECKED SPREAD (WORST CASE)')}
              </span>
              <h2 className="text-[22px] font-normal text-[#14231C] mt-0.5">
                {t('Scenario A: No Action (Worst Case)')}
              </h2>
            </div>
            <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-[#C13B3B] text-white">
              {t('Critical Failure')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[13px]">
            <div className="p-4 rounded-xl bg-[#F5F4F0] border border-[#E3E1D9] space-y-1">
              <span className="text-[11px] text-[#5C6259] block">{t('14-Day Infected Area')}</span>
              <span className="text-[28px] font-semibold text-[#C13B3B] tabular-nums block">
                <CountUp to={simulation?.scenarios.no_action.affected_area_percent || 0} duration={0.8} />%
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[#F5F4F0] border border-[#E3E1D9] space-y-1">
              <span className="text-[11px] text-[#5C6259] block">{t('Peak Risk Score')}</span>
              <span className="text-[28px] font-semibold text-[#14231C] tabular-nums block">
                <CountUp to={simulation?.scenarios.no_action.peak_risk || 0} duration={0.8} />/100
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[#F5F4F0] border border-[#E3E1D9] space-y-1">
              <span className="text-[11px] text-[#5C6259] block">{t('Estimated Harvest Loss')}</span>
              <span className="text-[28px] font-semibold text-[#C13B3B] tabular-nums block">
                <CountUp to={simulation?.scenarios.no_action.estimated_loss || 0} duration={1.0} prefix="₹" />
              </span>
            </div>
          </div>

          <p className="text-[13px] text-[#5C6259] leading-relaxed">
            Without intervention, elevated humidity sustains exponential spore multiplication, causing irreversible panicle blast damage across the plot.
          </p>
        </div>
      )}

      {/* 2. SCENARIO B: INTERVENE TODAY */}
      {activeScenario === 'intervene_today' && (
        <div className="rounded-[22px] border border-[#E3E1D9] bg-white p-6 sm:p-8 space-y-6">
          <div className="flex items-start justify-between border-b border-[#E3E1D9] pb-4">
            <div>
              <span className="text-[11px] uppercase tracking-[0.08em] text-[#2F9E5C] font-medium block">
                {t('RECOMMENDED PROPHYLACTIC DECISION')}
              </span>
              <h2 className="text-[22px] font-normal text-[#14231C] mt-0.5">
                {t('Scenario B: Intervene Today (Day 0)')}
              </h2>
            </div>
            <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-[#2F9E5C] text-white">
              {t('Maximum Avoided Loss')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[13px]">
            <div className="p-4 rounded-xl bg-[#F5F4F0] border border-[#E3E1D9] space-y-1">
              <span className="text-[11px] text-[#5C6259] block">{t('14-Day Infected Area')}</span>
              <span className="text-[28px] font-semibold text-[#14231C] tabular-nums block">
                <CountUp to={simulation?.scenarios.intervene_today.affected_area_percent || 0} duration={0.8} />%
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[#F5F4F0] border border-[#E3E1D9] space-y-1">
              <span className="text-[11px] text-[#5C6259] block">{t('Peak Risk Score')}</span>
              <span className="text-[28px] font-semibold text-[#14231C] tabular-nums block">
                <CountUp to={simulation?.scenarios.intervene_today.peak_risk || 0} duration={0.8} />/100
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[#F5F4F0] border border-[#E3E1D9] space-y-1">
              <span className="text-[11px] text-[#5C6259] block">{t('Estimated Harvest Loss')}</span>
              <span className="text-[28px] font-semibold text-[#2F9E5C] tabular-nums block">
                <CountUp to={simulation?.scenarios.intervene_today.estimated_loss || 0} duration={1.0} prefix="₹" />
              </span>
            </div>
          </div>

          <p className="text-[13px] text-[#5C6259] leading-relaxed">
            Applying certified bio-control (<em>Pseudomonas fluorescens</em>) immediately halts conidial spore germination and prevents panicle neck rot.
          </p>
        </div>
      )}

      {/* 3. SCENARIO C: INTERVENE AFTER X DAYS */}
      {activeScenario === 'intervene_day3' && (
        <div className="rounded-[22px] border border-[#E3E1D9] bg-white p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3E1D9] pb-4">
            <div>
              <span className="text-[11px] uppercase tracking-[0.08em] text-[#E0722F] font-medium block">
                {t('CONFIGURABLE DELAYED ACTION TRAJECTORY')}
              </span>
              <h2 className="text-[22px] font-normal text-[#14231C] mt-0.5">
                {t('Scenario C: Intervene After')} {delayDays} {t('Days')}
              </h2>
            </div>

            {/* Configurable X Days Input */}
            <div className="flex items-center gap-2 bg-[#F5F4F0] px-3.5 py-1.5 rounded-full border border-[#E3E1D9] self-start sm:self-auto">
              <Clock className="w-3.5 h-3.5 text-[#5C6259]" />
              <label htmlFor="delay-input" className="text-[12px] text-[#5C6259] whitespace-nowrap">
                {t('Intervene after:')}
              </label>
              <input
                id="delay-input"
                type="number"
                min="1"
                max="14"
                value={delayDays}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setDelayDays(isNaN(val) ? 1 : Math.max(1, Math.min(14, val)));
                }}
                className="w-12 text-center font-semibold bg-white border border-[#E3E1D9] rounded-full py-0.5 text-[13px] text-[#14231C] focus:outline-none focus:border-[#14231C] tabular-nums"
              />
              <span className="text-[12px] text-[#5C6259]">{t('Days')}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[13px]">
            <div className="p-4 rounded-xl bg-[#F5F4F0] border border-[#E3E1D9] space-y-1">
              <span className="text-[11px] text-[#5C6259] block">{t('14-Day Infected Area')}</span>
              <span className="text-[28px] font-semibold text-[#14231C] tabular-nums block">
                <CountUp to={simulation?.scenarios.intervene_after_3_days.affected_area_percent || 0} duration={0.8} />%
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[#F5F4F0] border border-[#E3E1D9] space-y-1">
              <span className="text-[11px] text-[#5C6259] block">{t('Peak Risk Score')}</span>
              <span className="text-[28px] font-semibold text-[#14231C] tabular-nums block">
                <CountUp to={simulation?.scenarios.intervene_after_3_days.peak_risk || 0} duration={0.8} />/100
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[#F5F4F0] border border-[#E3E1D9] space-y-1">
              <span className="text-[11px] text-[#5C6259] block">{t('Estimated Harvest Loss')}</span>
              <span className="text-[28px] font-semibold text-[#E0722F] tabular-nums block">
                <CountUp to={simulation?.scenarios.intervene_after_3_days.estimated_loss || 0} duration={1.0} prefix="₹" />
              </span>
            </div>
          </div>

          <p className="text-[13px] text-[#5C6259] leading-relaxed">
            Delaying containment by {delayDays} {delayDays === 1 ? 'day' : 'days'} gives airborne conidia time to incubate and infect adjoining vegetative canopy before bio-control suppression is applied.
          </p>
        </div>
      )}

      {/* Multi-Scenario Line Chart */}
      <div className="rounded-[22px] border border-[#E3E1D9] bg-white p-6 sm:p-8 space-y-4">
        <div className="border-b border-[#E3E1D9] pb-4">
          <div className="text-[11px] uppercase tracking-[0.08em] text-[#5C6259] font-medium mb-0.5">
            {t('CONTAGION PROJECTIONS')}
          </div>
          <h3 className="text-[20px] font-normal text-[#14231C]">{t('Infected Field Area Trajectory Comparison')}</h3>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3E1D9" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#5C6259' }} axisLine={false} tickLine={false} />
              <YAxis unit="%" tick={{ fontSize: 12, fill: '#5C6259' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
              <Line
                type="monotone"
                dataKey="scenarioA"
                name={t('Scenario A: No Action (Worst Case)')}
                stroke="#C13B3B"
                strokeWidth={2}
                dot={{ r: 4, fill: '#C13B3B' }}
              />
              <Line
                type="monotone"
                dataKey="scenarioB"
                name={t('Scenario B: Intervene Today (Day 0)')}
                stroke="#2F9E5C"
                strokeWidth={2.5}
                dot={{ r: 5, fill: '#2F9E5C' }}
              />
              <Line
                type="monotone"
                dataKey="scenarioC"
                name={`${t('Scenario C: Intervene After')} ${delayDays} Days`}
                stroke="#E0722F"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 4, fill: '#E0722F' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Simulator Tuning Parameters */}
      <div className="rounded-[22px] border border-[#E3E1D9] bg-white p-6 sm:p-7 space-y-4">
        <div className="border-b border-[#E3E1D9] pb-3 flex items-center gap-2">
          <Sliders className="h-4 w-4 text-[#14231C]" />
          <span className="text-[12px] uppercase tracking-[0.08em] text-[#5C6259] font-medium">
            {t('Propagation Tuning Parameters')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-[13px] pt-1">
          <div>
            <div className="flex justify-between text-[#14231C] font-medium mb-1.5">
              <span>{t('Pathogen Propagation Factor (β)')}</span>
              <span className="tabular-nums">{propagationFactor.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.40"
              step="0.01"
              value={propagationFactor}
              onChange={(e) => setPropagationFactor(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-[#E3E1D9] rounded-lg appearance-none cursor-pointer accent-[#14231C]"
            />
            <span className="text-[11px] text-[#5C6259] mt-1 block">Neighbor node contagion rate</span>
          </div>

          <div>
            <div className="flex justify-between text-[#14231C] font-medium mb-1.5">
              <span>{t('Micro-climate Weather Modifier')}</span>
              <span className="tabular-nums">{weatherModifier.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.70"
              max="1.50"
              step="0.05"
              value={weatherModifier}
              onChange={(e) => setWeatherModifier(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-[#E3E1D9] rounded-lg appearance-none cursor-pointer accent-[#14231C]"
            />
            <span className="text-[11px] text-[#5C6259] mt-1 block">High humidity spore amplification</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SimulatePage() {
  return (
    <Suspense fallback={<div className="max-w-5xl mx-auto p-12 text-center text-[13px] text-[#5C6259]">Loading spread simulator...</div>}>
      <SimulateContent />
    </Suspense>
  );
}
