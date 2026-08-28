'use client';

import React from 'react';
import { RiskPrediction } from '@/types';
import { useTranslation } from '@/lib/context/LanguageContext';

interface RiskFactorCardProps {
  prediction: RiskPrediction;
}

export function RiskFactorCard({ prediction }: RiskFactorCardProps) {
  const { t } = useTranslation();
  const isCritical = prediction.risk_score >= 75;

  return (
    <div className="rounded-[22px] border border-[#E3E1D9] bg-white p-6 sm:p-7 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-[#E3E1D9] pb-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.08em] text-[#5C6259] font-medium mb-0.5">
            {t('WEIGHTED FACTOR BREAKDOWN')}
          </div>
          <h3 className="text-[20px] font-normal text-[#14231C]">
            {t('Weighted Factor Impacts')}
          </h3>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
          isCritical ? 'bg-[#C13B3B] text-white' : 'bg-[#E3E1D9] text-[#5C6259]'
        }`}>
          {prediction.risk_score}/100 {t('Risk Score')}
        </span>
      </div>

      {/* Factor Bars */}
      <div className="space-y-4">
        {prediction.factors_json.map((factor) => {
          const isHighFactor = factor.score >= 75;

          return (
            <div key={factor.name} className="space-y-1.5 text-[13px]">
              <div className="flex items-center justify-between">
                <span className="text-[#14231C] font-medium">{t(factor.name)}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#5C6259]">{t('Weight')} {(factor.weight * 100).toFixed(0)}%</span>
                  <span className="font-semibold text-[#14231C] tabular-nums">+{factor.impact} pts</span>
                </div>
              </div>

              {/* Minimal Clean Progress Bar */}
              <div className="w-full bg-[#E3E1D9] rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    isHighFactor ? 'bg-[#C13B3B]' : 'bg-[#14231C]'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, factor.score))}%` }}
                />
              </div>

              <p className="text-[11px] text-[#5C6259] leading-tight">{t(factor.description)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
