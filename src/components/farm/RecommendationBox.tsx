'use client';

import React from 'react';
import { ActionRecommendation } from '@/types';
import { ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';
import { formatINR } from '@/lib/utils';

interface RecommendationBoxProps {
  recommendation: ActionRecommendation;
}

export function RecommendationBox({ recommendation }: RecommendationBoxProps) {
  const isImmediate = recommendation.timing === 'within_24_hours' || recommendation.priority === 'high';

  return (
    <div className="rounded-[24px] bg-[#1F3A2E] text-white p-7 sm:p-9 space-y-6">
      {/* Header Eyebrow + Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2B4E3E] pb-4">
        <div className="space-y-1">
          <div className="text-[11px] uppercase tracking-[0.08em] text-[#869283] font-medium flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E0722F]" />
            PRIMARY AGRONOMIC ADVISORY
          </div>
          <h3 className="text-[22px] sm:text-[24px] font-normal leading-tight text-white">
            {recommendation.action}
          </h3>
        </div>
        <div className="self-start sm:self-auto">
          <span className="inline-block px-3 py-1 rounded-full text-[12px] font-medium bg-white/10 text-white border border-white/15">
            {recommendation.timing}
          </span>
        </div>
      </div>

      {/* Cultural & Biological Protocol Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[13px]">
        {/* Biological Controls */}
        <div className="space-y-2.5">
          <span className="text-[12px] uppercase tracking-[0.08em] text-[#A3ABA0] font-medium block">
            Approved Bio-Control Application:
          </span>
          <ul className="space-y-2 text-[#E4EBE2]">
            {recommendation.biological_measures?.map((bio, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2F9E5C] mt-2 shrink-0" />
                <span>{bio}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Cultural Measures */}
        <div className="space-y-2.5">
          <span className="text-[12px] uppercase tracking-[0.08em] text-[#A3ABA0] font-medium block">
            Cultural & Field Sanitization:
          </span>
          <ul className="space-y-2 text-[#E4EBE2]">
            {recommendation.cultural_measures?.map((cult, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E3E1D9]/60 mt-2 shrink-0" />
                <span>{cult}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer Strip with Inverted Pill Button */}
      <div className="pt-4 border-t border-[#2B4E3E] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-[12px] text-[#A3ABA0] max-w-md leading-normal">
          {recommendation.reason} · <span className="text-[#869283]">{recommendation.safety_notice}</span>
        </p>

        <button
          onClick={() => alert('Advisory protocol logged. Field instructions sent to KVK extension desk.')}
          className="inline-flex items-center justify-center rounded-full bg-white text-[#1F3A2E] hover:bg-[#F5F4F0] px-5 py-2.5 text-[13px] font-medium transition-all group shrink-0"
        >
          <span>Acknowledge Protocol</span>
          <span className="w-4 h-4 rounded-full bg-[#1F3A2E]/10 group-hover:bg-[#1F3A2E]/20 transition-colors flex items-center justify-center ml-2 shrink-0">
            <ArrowRight className="w-2.5 h-2.5 text-[#1F3A2E]" />
          </span>
        </button>
      </div>
    </div>
  );
}
