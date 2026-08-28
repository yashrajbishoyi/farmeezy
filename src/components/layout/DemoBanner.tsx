'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { DEMO_FARM_ID } from '@/lib/seeds/demo-farms';
import { useTranslation } from '@/lib/context/LanguageContext';

export function DemoBanner() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('farmeezy_demo_banner_dismissed');
    if (!dismissed) {
      setVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem('farmeezy_demo_banner_dismissed', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="bg-[#14231C] text-[#F5F4F0] text-[12px] py-2 px-4 sm:px-6 transition-all border-b border-[#23372E]">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2F9E5C]" />
          <span>
            <strong>{t('SIH 2026 Live Prototype:')}</strong> {t('Active Odisha Rice scenario loaded (Rice Blast · 81/100 Risk).')}
          </span>
          <Link href={`/farm/${DEMO_FARM_ID}`} className="underline text-white/80 hover:text-white ml-1.5 hidden sm:inline">
            {t('View Live Farm →')}
          </Link>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-colors"
          title="Dismiss notification"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
