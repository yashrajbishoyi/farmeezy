'use client';

import React from 'react';
import Link from 'next/link';
import { Sprout, ArrowRight } from 'lucide-react';
import { DEMO_FARM_ID } from '@/lib/seeds/demo-farms';
import { useTranslation } from '@/lib/context/LanguageContext';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="w-full bg-[#1F3A2E] text-[#F5F4F0] pt-14 pb-28 md:pb-10 px-6 sm:px-10 mt-16 sm:mt-20 border-t border-[#182E24]">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Top Row: Brand Lockup & Inverted Pill CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-10 border-b border-[#2B4E3E]">
          <div className="space-y-2">
            <Link href="/" className="inline-flex items-center gap-2 text-white">
              <Sprout className="h-5 w-5 stroke-[1.75] text-[#A3ABA0]" />
              <span className="text-lg font-normal tracking-tight text-white">{t('Farmeezy')}</span>
            </Link>
            <p className="text-[13px] text-[#A3ABA0] max-w-sm leading-relaxed">
              {t('A closed-loop epidemiological system that pairs multimodal foliage diagnosis with deterministic microclimate risk modeling and economic yield protection.')}
            </p>
          </div>

          <Link href={`/farm/${DEMO_FARM_ID}`}>
            <button className="inline-flex items-center justify-center rounded-full bg-white text-[#1F3A2E] hover:bg-[#F5F4F0] px-6 py-3 text-[14px] font-medium transition-all group">
              <span>{t('Open Dashboard')}</span>
              <span className="w-5 h-5 rounded-full bg-[#1F3A2E]/10 group-hover:bg-[#1F3A2E]/20 transition-colors flex items-center justify-center ml-2.5">
                <ArrowRight className="w-3 h-3 text-[#1F3A2E]" />
              </span>
            </button>
          </Link>
        </div>

        {/* 4-Column Navigation Link Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-[13px]">
          <div className="space-y-3">
            <span className="text-[11px] uppercase tracking-[0.08em] text-[#869283] font-medium block">
              {t('Product')}
            </span>
            <ul className="space-y-2.5 text-[#C4CCC1]">
              <li><Link href={`/farm/${DEMO_FARM_ID}`} className="hover:text-white transition-colors">{t('Farm Health Dashboard')}</Link></li>
              <li><Link href="/diagnose" className="hover:text-white transition-colors">{t('AI Leaf Diagnosis')}</Link></li>
              <li><Link href="/simulate" className="hover:text-white transition-colors">{t('Spread Simulator')}</Link></li>
              <li><Link href="/assistant" className="hover:text-white transition-colors">{t('AI Agronomic Advisor')}</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <span className="text-[11px] uppercase tracking-[0.08em] text-[#869283] font-medium block">
              {t('For Officers')}
            </span>
            <ul className="space-y-2.5 text-[#C4CCC1]">
              <li><Link href="/officer" className="hover:text-white transition-colors">{t('District Operations')}</Link></li>
              <li><Link href="/map" className="hover:text-white transition-colors">{t('Surveillance Radar')}</Link></li>
              <li><Link href="/officer" className="hover:text-white transition-colors">{t('Priority Dispatch')}</Link></li>
              <li><Link href="/map" className="hover:text-white transition-colors">{t('DBSCAN Clusters')}</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <span className="text-[11px] uppercase tracking-[0.08em] text-[#869283] font-medium block">
              {t('Intelligence')}
            </span>
            <ul className="space-y-2.5 text-[#C4CCC1]">
              <li><span className="text-[#869283]">{t('Deterministic Risk Formula')}</span></li>
              <li><span className="text-[#869283]">{t('Graph Contagion Simulation')}</span></li>
              <li><span className="text-[#869283]">{t('MSP Economic Loss Model')}</span></li>
              <li><span className="text-[#869283]">{t('Open-Meteo Telemetry')}</span></li>
            </ul>
          </div>

          <div className="space-y-3">
            <span className="text-[11px] uppercase tracking-[0.08em] text-[#869283] font-medium block">
              {t('PWA Web App')}
            </span>
            <ul className="space-y-2.5 text-[#C4CCC1]">
              <li><span className="text-[#869283]">Android Chrome Support</span></li>
              <li><span className="text-[#869283]">iOS Safari Web App</span></li>
              <li><span className="text-[#869283]">Offline Telemetry Cache</span></li>
              <li><span className="text-[#869283]">Standalone Fullscreen</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Fine Print Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-8 border-t border-[#2B4E3E] text-[11px] text-[#869283]">
          <span>© 2026 Farmeezy. Built for Smart India Hackathon.</span>
          <span className="sm:text-right">
            Progressive Web App enabled for Android & iOS mobile devices.
          </span>
        </div>
      </div>
    </footer>
  );
}
