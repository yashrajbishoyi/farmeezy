'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface SwapCardItem {
  id: string;
  label: string;
  badge?: string;
  content: React.ReactNode;
}

interface CardSwapProps {
  cards: SwapCardItem[];
  defaultCardId?: string;
  className?: string;
  onCardChange?: (id: string) => void;
}

export function CardSwap({
  cards,
  defaultCardId,
  className = '',
  onCardChange,
}: CardSwapProps) {
  const [activeId, setActiveId] = useState<string>(defaultCardId || cards[0]?.id || '');
  const shouldReduceMotion = useReducedMotion();

  const handleSelect = (id: string) => {
    setActiveId(id);
    if (onCardChange) onCardChange(id);
  };

  const activeCard = cards.find((c) => c.id === activeId) || cards[0];

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Selector Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200/80 overflow-x-auto">
        {cards.map((card) => {
          const isActive = card.id === activeId;
          return (
            <button
              key={card.id}
              onClick={() => handleSelect(card.id)}
              className={cn(
                'flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all relative whitespace-nowrap text-center',
                isActive
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-800'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeSwapPill"
                  className="absolute inset-0 bg-white rounded-lg -z-0 border border-slate-200/60 shadow-sm"
                  transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', damping: 25, stiffness: 200 }}
                />
              )}
              <span className="relative z-10 flex items-center justify-center gap-1.5">
                {card.label}
                {card.badge && (
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.2 rounded font-bold uppercase',
                      isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    )}
                  >
                    {card.badge}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Focused Card Body */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeId}
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="w-full"
        >
          {activeCard?.content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
