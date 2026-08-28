'use client';

import React from 'react';
import { WeatherForecast } from '@/types';
import { CloudRain, Wind, Droplets, Thermometer } from 'lucide-react';
import { getWeatherConditionText } from '@/lib/services/weather';
import { useTranslation } from '@/lib/context/LanguageContext';

interface WeatherCardProps {
  weather: WeatherForecast;
}

export function WeatherCard({ weather }: WeatherCardProps) {
  const { t } = useTranslation();
  const isHighHumidity = weather.current.humidity >= 80;

  return (
    <div className="rounded-[22px] border border-[#E3E1D9] bg-white p-6 sm:p-7 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-[#E3E1D9] pb-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.08em] text-[#5C6259] font-medium mb-0.5">
            {t('MICRO-CLIMATE TELEMETRY (OPEN-METEO)')}
          </div>
          <h3 className="text-[20px] font-normal text-[#14231C]">
            {t('Live Environmental Pressure')}
          </h3>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
          isHighHumidity ? 'bg-[#C13B3B] text-white' : 'bg-[#E3E1D9] text-[#5C6259]'
        }`}>
          {isHighHumidity ? t('Spore Favorable') : t('Normal Conditions')}
        </span>
      </div>

      {/* Current 4 Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[13px]">
        <div className="p-3.5 rounded-xl border border-[#E3E1D9] bg-[#F5F4F0] space-y-1">
          <span className="text-[11px] text-[#5C6259] block">{t('Temperature')}</span>
          <span className="text-[22px] font-semibold text-[#14231C] tabular-nums block">
            {weather.current.temperature.toFixed(1)}°C
          </span>
          <span className="text-[11px] text-[#5C6259] truncate block">
            {t(weather.daily?.[0]?.condition_text || 'Partly Cloudy')}
          </span>
        </div>

        <div className="p-3.5 rounded-xl border border-[#E3E1D9] bg-[#F5F4F0] space-y-1">
          <span className="text-[11px] text-[#5C6259] block">{t('Relative Humidity')}</span>
          <span className="text-[22px] font-semibold text-[#14231C] tabular-nums block">
            {weather.current.humidity}%
          </span>
          <span className="text-[11px] text-[#5C6259] block">{t('Fungal threshold 85%')}</span>
        </div>

        <div className="p-3.5 rounded-xl border border-[#E3E1D9] bg-[#F5F4F0] space-y-1">
          <span className="text-[11px] text-[#5C6259] block">{t('24h Rainfall')}</span>
          <span className="text-[22px] font-semibold text-[#14231C] tabular-nums block">
            {weather.current.rainfall} mm
          </span>
          <span className="text-[11px] text-[#5C6259] block">{t('Leaf wetness active')}</span>
        </div>

        <div className="p-3.5 rounded-xl border border-[#E3E1D9] bg-[#F5F4F0] space-y-1">
          <span className="text-[11px] text-[#5C6259] block">{t('Wind Velocity')}</span>
          <span className="text-[22px] font-semibold text-[#14231C] tabular-nums block">
            {weather.current.wind_speed} km/h
          </span>
          <span className="text-[11px] text-[#5C6259] block">{t('Regional dispersal')}</span>
        </div>
      </div>

      {/* 7-Day Micro Strip */}
      <div className="space-y-2 pt-2 border-t border-[#E3E1D9]">
        <span className="text-[11px] uppercase tracking-[0.08em] text-[#5C6259] font-medium block">
          {t('7-Day Forecast Matrix')}
        </span>
        <div className="grid grid-cols-7 gap-1.5 text-center text-[11px]">
          {weather.daily.slice(0, 7).map((day) => {
            const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'narrow' });

            return (
              <div key={day.date} className="p-2 rounded-lg border border-[#E3E1D9] bg-white space-y-1">
                <span className="font-medium text-[#14231C] block">{dayName}</span>
                <span className="text-[10px] text-[#5C6259] block tabular-nums">{day.temp_max.toFixed(0)}°</span>
                <span className="text-[10px] font-medium text-[#14231C] block tabular-nums">{day.humidity_mean}%</span>
                <span className="text-[9px] text-[#5C6259] block tabular-nums">{day.rainfall_sum}mm</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
