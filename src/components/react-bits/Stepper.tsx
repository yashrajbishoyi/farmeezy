'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StepItem {
  title: string;
  subtitle?: string;
  meta?: string;
  badge?: string;
}

interface StepperProps {
  steps: StepItem[];
  activeStep: number; // 0-indexed
  className?: string;
  onStepClick?: (stepIndex: number) => void;
}

export function Stepper({
  steps,
  activeStep,
  className = '',
  onStepClick,
}: StepperProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className={cn('w-full overflow-x-auto no-scrollbar py-2', className)}>
      <div className="flex items-center justify-between relative min-w-[340px] px-2">
        {/* Progress connecting line background */}
        <div className="absolute left-6 right-6 top-4 -translate-y-1/2 h-[1.5px] bg-[#E3E1D9] -z-0" />
        
        {/* Active connecting line fill */}
        <motion.div
          className="absolute left-6 top-4 -translate-y-1/2 h-[1.5px] bg-[#14231C] -z-0"
          initial={false}
          animate={{
            width: steps.length > 1 ? `${(activeStep / (steps.length - 1)) * 100}%` : '0%',
          }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.4, ease: 'easeInOut' }}
        />

        {steps.map((step, idx) => {
          const isPassed = idx < activeStep;
          const isCurrent = idx === activeStep;

          return (
            <div
              key={idx}
              onClick={() => onStepClick && onStepClick(idx)}
              className={cn(
                'flex flex-col items-center relative z-10 cursor-default group',
                onStepClick && 'cursor-pointer'
              )}
            >
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1.05 : 1,
                }}
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-medium transition-colors',
                  isPassed
                    ? 'bg-[#14231C] text-white'
                    : isCurrent
                    ? 'bg-white text-[#14231C] border-2 border-[#14231C]'
                    : 'bg-white text-[#7A8177] border border-[#E3E1D9]'
                )}
              >
                {isPassed ? (
                  <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </motion.div>

              <div className="mt-2 text-center max-w-[95px]">
                <p
                  className={cn(
                    'text-[12px] font-medium leading-tight truncate',
                    isCurrent
                      ? 'text-[#14231C]'
                      : isPassed
                      ? 'text-[#14231C]'
                      : 'text-[#7A8177]'
                  )}
                >
                  {step.title}
                </p>
                {step.subtitle && (
                  <p className="text-[10px] text-[#5C6259] mt-0.5 truncate">{step.subtitle}</p>
                )}
                {step.meta && (
                  <span
                    className={cn(
                      'inline-block text-[9px] px-1.5 py-0.5 rounded-full mt-0.5 font-normal',
                      isCurrent ? 'bg-[#F5F4F0] text-[#14231C] border border-[#E3E1D9]' : 'text-[#7A8177]'
                    )}
                  >
                    {step.meta}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
