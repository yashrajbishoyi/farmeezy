import React from 'react';
import { Crop, GrowthStage } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Sprout, CheckCircle2 } from 'lucide-react';

interface GrowthStageProgressProps {
  crop: Crop;
  sowingDate: string;
}

export function GrowthStageProgress({ crop, sowingDate }: GrowthStageProgressProps) {
  const daysSinceSowing = Math.max(
    0,
    Math.floor((Date.now() - new Date(sowingDate).getTime()) / (24 * 60 * 60 * 1000))
  );

  const stages = crop.growth_stages || [];
  const currentStageIndex = stages.findIndex(
    (st) => daysSinceSowing >= st.days_start && daysSinceSowing <= st.days_end
  );
  const activeIndex = currentStageIndex === -1 ? stages.length - 1 : currentStageIndex;
  const currentStage = stages[activeIndex];

  return (
    <div className="rounded-xl border border-emerald-950/10 bg-white p-5 space-y-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
            <Sprout className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Crop Growth Lifecycle</h4>
            <p className="text-xs text-slate-500">Day {daysSinceSowing} since sowing ({sowingDate})</p>
          </div>
        </div>
        {currentStage && (
          <Badge variant="agri" className="bg-emerald-50 text-emerald-900 border-emerald-200">
            Active: {currentStage.stage} ({(currentStage.susceptibility * 100).toFixed(0)}% Vulnerability)
          </Badge>
        )}
      </div>

      {/* Visual Stepper */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
        {stages.map((stage, idx) => {
          const isPassed = idx < activeIndex;
          const isCurrent = idx === activeIndex;

          return (
            <div
              key={stage.stage}
              className={`p-3 rounded-lg border text-xs transition-all ${
                isCurrent
                  ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20'
                  : isPassed
                  ? 'border-slate-200 bg-slate-50/60 text-slate-600'
                  : 'border-slate-100 bg-white text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-[11px] text-slate-500">Step {idx + 1}</span>
                {isPassed ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                ) : isCurrent ? (
                  <span className="h-2 w-2 rounded-full bg-emerald-600 animate-ping" />
                ) : null}
              </div>
              <p className={`font-bold truncate ${isCurrent ? 'text-emerald-950' : 'text-slate-700'}`}>
                {stage.stage}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Days {stage.days_start}–{stage.days_end}
              </p>
              <div className="mt-2 pt-1.5 border-t border-slate-200/50 flex justify-between text-[10px]">
                <span className="text-slate-400">Risk Weight</span>
                <span className={`font-semibold ${stage.susceptibility >= 0.8 ? 'text-rose-600' : 'text-slate-700'}`}>
                  {Math.round(stage.susceptibility * 100)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
