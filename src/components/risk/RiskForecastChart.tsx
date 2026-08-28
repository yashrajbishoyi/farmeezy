'use client';

import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { RiskForecastPoint } from '@/types';

interface RiskForecastChartProps {
  forecast: RiskForecastPoint[];
}

export function RiskForecastChart({ forecast }: RiskForecastChartProps) {
  const chartData = forecast.map((pt, idx) => ({
    name: idx === 0 ? 'Today' : `Day +${pt.day_offset}`,
    date: pt.date,
    risk: pt.risk_score,
    rainfall: pt.rainfall_expected,
    weather: pt.weather_factor,
    level: pt.risk_level,
  }));

  const maxRisk = Math.max(...forecast.map(f => f.risk_score));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#14231C] text-white p-3 rounded-xl shadow-md text-[12px] space-y-1 border border-[#23372E]">
          <p className="font-medium text-[#F5F4F0]">{label} ({data.date})</p>
          <p className="font-semibold text-[#E0722F]">
            Pathogen Risk: {data.risk}/100 ({data.level.toUpperCase()})
          </p>
          <p className="text-[#A3ABA0]">
            Rainfall Expected: {data.rainfall} mm
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-[22px] border border-[#E3E1D9] bg-white p-6 sm:p-7 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-[#E3E1D9] pb-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.08em] text-[#5C6259] font-medium mb-0.5">
            EPIDEMIOLOGICAL TRAJECTORY
          </div>
          <h3 className="text-[20px] font-normal text-[#14231C]">
            7-Day Deterministic Risk Curve
          </h3>
        </div>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#C13B3B] text-white">
          Peak {maxRisk}/100
        </span>
      </div>

      {/* Chart */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="riskGradientEditorial" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C13B3B" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#C13B3B" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3E1D9" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#5C6259' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#5C6259' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={75} stroke="#C13B3B" strokeDasharray="3 3" label={{ value: 'Critical 75', fill: '#C13B3B', fontSize: 10, position: 'insideTopRight' }} />
            <ReferenceLine y={50} stroke="#E0722F" strokeDasharray="3 3" label={{ value: 'High 50', fill: '#E0722F', fontSize: 10, position: 'insideTopRight' }} />
            <Area
              type="monotone"
              dataKey="risk"
              stroke="#C13B3B"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#riskGradientEditorial)"
              dot={{ r: 3.5, fill: '#C13B3B' }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[11px] text-[#5C6259] pt-3 border-t border-[#E3E1D9]">
        <span>Calculated with Open-Meteo precipitation and humidity forecast.</span>
        <span className="font-medium text-[#C13B3B]">Trajectory: Accelerating</span>
      </div>
    </div>
  );
}
