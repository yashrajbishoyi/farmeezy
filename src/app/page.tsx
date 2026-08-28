'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Sprout, 
  ArrowRight, 
  ShieldCheck, 
  Activity, 
  PlayCircle, 
  TrendingUp, 
  MapPin, 
  CloudRain,
  Shield,
  Layers,
  Cpu
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { useTranslation } from '@/lib/context/LanguageContext';

export default function LandingPage() {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="space-y-12 sm:space-y-20 pb-16 overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 pt-2">
        <div className="relative rounded-[26px] sm:rounded-[32px] overflow-hidden min-h-[440px] sm:min-h-[540px] flex flex-col justify-between p-6 sm:p-12 text-white shadow-none">
          {/* Full-bleed background image with subtle atmospheric tint */}
          <div 
            className="absolute inset-0 bg-cover bg-center -z-10"
            style={{
              backgroundImage: `linear-gradient(to bottom, rgba(20, 35, 28, 0.42), rgba(20, 35, 28, 0.72)), url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1800&q=85')`,
            }}
          />

          {/* Top Eyebrow badge inside hero */}
          <div>
            <span className="inline-block text-[11px] sm:text-[12px] uppercase tracking-[0.08em] font-medium text-white/85 bg-white/10 backdrop-blur-md px-3 sm:px-3.5 py-1 rounded-full border border-white/15">
              {t('Smart India Hackathon 2026')}
            </span>
          </div>

          {/* Bottom Content: Light-weight display headline + Inverted pill button */}
          <div className="space-y-4 sm:space-y-6 max-w-2xl">
            <h1 className="text-[32px] sm:text-[46px] md:text-[58px] leading-[1.08] font-normal tracking-[-0.03em] text-white">
              {t('Predict Before It Spreads.')}
            </h1>
            <p className="text-[14px] sm:text-[16px] leading-[1.55] text-white/85 max-w-xl font-normal">
              {t('A closed-loop epidemiological system that pairs multimodal foliage diagnosis with deterministic microclimate risk modeling and economic yield protection.')}
            </p>

            <div className="pt-1 sm:pt-2 flex flex-wrap items-center gap-3">
              <Link href={user ? (user.role === 'farmer' ? `/farm/${user.farmId || 'demo-farm-01'}` : '/officer') : '/login'}>
                <button className="inline-flex items-center justify-center rounded-full bg-white text-[#14231C] hover:bg-[#F5F4F0] px-5 sm:px-6 py-2.5 sm:py-3 text-[13px] sm:text-[14px] font-medium transition-all group shadow-none">
                  <span>{user ? t('Enter Dashboard') : t('Sign In & Explore')}</span>
                  <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#14231C]/10 group-hover:bg-[#14231C]/20 transition-colors flex items-center justify-center ml-2 shrink-0">
                    <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#14231C]" />
                  </span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. "MEET FARMEEZY" TWO-COLUMN SECTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
          {/* Left: Section eyebrow + Display H2 + Pill CTA */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6">
            <div className="text-[11px] sm:text-[12px] uppercase tracking-[0.08em] text-[#5C6259] font-medium">
              {t('EPIDEMIOLOGICAL FORECASTING')}
            </div>
            <h2 className="text-[28px] sm:text-[40px] md:text-[46px] leading-[1.12] font-normal tracking-[-0.025em] text-[#14231C]">
              {t('Meet Farmeezy.')}
            </h2>
            <div>
              <Link href={user ? `/farm/${user.farmId || 'demo-farm-01'}` : '/login'}>
                <button className="inline-flex items-center justify-center rounded-full bg-[#14231C] text-[#F5F4F0] hover:bg-[#23372E] px-5 sm:px-6 py-2 sm:py-2.5 text-[13px] font-medium transition-all group">
                  <span>{user ? t('View Health') : t('Get Started')}</span>
                  <span className="w-4 h-4 rounded-full bg-white/20 group-hover:bg-white/30 transition-colors flex items-center justify-center ml-2 shrink-0">
                    <ArrowRight className="w-2.5 h-2.5 text-white" />
                  </span>
                </button>
              </Link>
            </div>
          </div>

          {/* Right: Generously spaced narrative body paragraph */}
          <div className="lg:col-span-7 pt-1 sm:pt-2">
            <p className="text-[15px] sm:text-[17px] leading-[1.65] text-[#5C6259] font-normal">
              {t('Most crop diagnostic applications stop at identifying visible symptoms once leaf damage has already occurred. Farmeezy bridges diagnostics with atmospheric physics, phenology, and graph simulations to forecast risk trajectories 7 days in advance — before spores germinate across adjacent farming clusters.')}
            </p>
          </div>
        </div>
      </section>

      {/* 3. 3-PILLAR FEATURE CARDS */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {/* Card 1: Paper Background */}
          <div className="rounded-[22px] sm:rounded-[24px] border border-[#E3E1D9] bg-white p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-2.5">
              <span className="text-[11px] uppercase tracking-[0.08em] text-[#5C6259] font-medium block">
                {t('01 / VISION DIAGNOSIS')}
              </span>
              <h3 className="text-[20px] sm:text-[22px] font-normal text-[#14231C] leading-snug">
                {t('Diagnosis that sees.')}
              </h3>
              <p className="text-[13px] sm:text-[14px] leading-[1.6] text-[#5C6259]">
                {t('Multimodal AI vision model extracts cellular and lesion characteristics, providing differential diagnoses with self-assessed confidence intervals.')}
              </p>
            </div>
            <div className="pt-4 border-t border-[#E3E1D9]">
              <span className="text-[12px] text-[#14231C] font-medium">
                {t('Structured AI diagnostic contract')}
              </span>
            </div>
          </div>

          {/* Card 2: Dusk Green Contrast Background */}
          <div className="rounded-[22px] sm:rounded-[24px] bg-[#1F3A2E] text-white p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-2.5">
              <span className="text-[11px] uppercase tracking-[0.08em] text-[#869283] font-medium block">
                {t('02 / RISK SYNTHESIS')}
              </span>
              <h3 className="text-[20px] sm:text-[22px] font-normal text-white leading-snug">
                {t('Always predictive, always calibrated.')}
              </h3>
              <p className="text-[13px] sm:text-[14px] leading-[1.6] text-[#C4CCC1]">
                {t('Mathematical formula synthesizing microclimate temperature, relative humidity, crop growth stage vulnerability, and spatial outbreak pressure.')}
              </p>
            </div>
            <div className="pt-4 border-t border-[#2B4E3E]">
              <span className="text-[12px] text-white font-medium">
                {t('Deterministic 0–100 risk score')}
              </span>
            </div>
          </div>

          {/* Card 3: Dusk Green Contrast Background */}
          <div className="rounded-[22px] sm:rounded-[24px] bg-[#1F3A2E] text-white p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-2.5">
              <span className="text-[11px] uppercase tracking-[0.08em] text-[#869283] font-medium block">
                {t('03 / SIMULATION')}
              </span>
              <h3 className="text-[20px] sm:text-[22px] font-normal text-white leading-snug">
                {t('Fully simulated spread.')}
              </h3>
              <p className="text-[13px] sm:text-[14px] leading-[1.6] text-[#C4CCC1]">
                {t('Discrete-event contagion model comparing 14-day outcomes across immediate bio-control application versus delayed or zero intervention.')}
              </p>
            </div>
            <div className="pt-4 border-t border-[#2B4E3E]">
              <span className="text-[12px] text-white font-medium">
                {t('Avoidable economic loss model')}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FOUR CORE CAPABILITIES */}
      <section id="intelligence" className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="rounded-[24px] sm:rounded-[28px] border border-[#E3E1D9] bg-white p-6 sm:p-10 md:p-12 space-y-8 sm:space-y-10">
          <div className="max-w-xl space-y-2">
            <div className="text-[11px] uppercase tracking-[0.08em] text-[#5C6259] font-medium">
              {t('CORE SYSTEM ARCHITECTURE')}
            </div>
            <h2 className="text-[24px] sm:text-[32px] md:text-[36px] font-normal text-[#14231C] tracking-tight">
              {t('Four Autonomous Engines. One Closed Loop.')}
            </h2>
            <p className="text-[13px] sm:text-[14px] text-[#5C6259] leading-relaxed">
              {t('Engineered from the ground up for the Smart India Hackathon 2026 to transform agricultural diagnostics into actionable agronomic decisions.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Engine 1 */}
            <div className="flex gap-3.5 sm:gap-4 items-start">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#F5F4F0] border border-[#E3E1D9] flex items-center justify-center shrink-0 text-[#14231C]">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5 stroke-[1.75]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-[15px] sm:text-[17px] font-medium text-[#14231C]">{t('Multimodal Vision Diagnostics')}</h4>
                <p className="text-[12px] sm:text-[13px] text-[#5C6259] leading-relaxed">
                  {t('Extracts lesion morphology, concentric rings, and discoloration patterns with structured JSON outputs and self-assessed confidence metrics.')}
                </p>
              </div>
            </div>

            {/* Engine 2 */}
            <div className="flex gap-3.5 sm:gap-4 items-start">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#F5F4F0] border border-[#E3E1D9] flex items-center justify-center shrink-0 text-[#14231C]">
                <CloudRain className="h-4 w-4 sm:h-5 sm:w-5 stroke-[1.75]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-[15px] sm:text-[17px] font-medium text-[#14231C]">{t('Deterministic Risk Synthesizer')}</h4>
                <p className="text-[12px] sm:text-[13px] text-[#5C6259] leading-relaxed">
                  {t('Fuses Open-Meteo telemetry (humidity, rain, temperature) with phenological growth stage tables to compute an un-hallucinated 0–100 threat score.')}
                </p>
              </div>
            </div>

            {/* Engine 3 */}
            <div className="flex gap-3.5 sm:gap-4 items-start">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#F5F4F0] border border-[#E3E1D9] flex items-center justify-center shrink-0 text-[#14231C]">
                <PlayCircle className="h-4 w-4 sm:h-5 sm:w-5 stroke-[1.75]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-[15px] sm:text-[17px] font-medium text-[#14231C]">{t('Contagion Graph Simulator')}</h4>
                <p className="text-[12px] sm:text-[13px] text-[#5C6259] leading-relaxed">
                  {t('Simulates pathogen diffusion across farm clusters over a 14-day horizon, comparing immediate bio-control containment against unchecked spread.')}
                </p>
              </div>
            </div>

            {/* Engine 4 */}
            <div className="flex gap-3.5 sm:gap-4 items-start">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#F5F4F0] border border-[#E3E1D9] flex items-center justify-center shrink-0 text-[#14231C]">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 stroke-[1.75]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-[15px] sm:text-[17px] font-medium text-[#14231C]">{t('MSP-Calibrated Economic Model')}</h4>
                <p className="text-[12px] sm:text-[13px] text-[#5C6259] leading-relaxed">
                  {t('Translates biological damage into financial exposure in INR (₹) based on Minimum Support Prices, highlighting net benefit and ROI of timely action.')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. "POWERED BY" TRUST STRIP */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 text-center space-y-3 sm:space-y-4">
        <p className="text-[11px] sm:text-[12px] uppercase tracking-[0.08em] text-[#5C6259] font-medium">
          {t('Built on open platforms and verified agronomic datasets')}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-8 gap-y-2.5 text-[13px] sm:text-[14px] text-[#5C6259] font-normal">
          <span>Open-Meteo Telemetry</span>
          <span className="hidden sm:inline">·</span>
          <span>Gemini Vision</span>
          <span className="hidden sm:inline">·</span>
          <span>Supabase PostgreSQL</span>
          <span className="hidden sm:inline">·</span>
          <span>Leaflet Maps</span>
          <span className="hidden sm:inline">·</span>
          <span>ICAR Pathology Benchmarks</span>
        </div>
      </section>

      {/* 6. USE MODES: FARMER VS OFFICER */}
      <section id="use-modes" className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
          <div className="lg:col-span-5 space-y-3 sm:space-y-4">
            <div className="text-[11px] sm:text-[12px] uppercase tracking-[0.08em] text-[#5C6259] font-medium">
              {t('DUAL-PERSONA DEPLOYMENT')}
            </div>
            <h2 className="text-[26px] sm:text-[36px] md:text-[40px] leading-[1.12] font-normal tracking-[-0.025em] text-[#14231C]">
              {t('Tailored for Farmers and District Extension.')}
            </h2>
            <p className="text-[14px] sm:text-[15px] leading-[1.65] text-[#5C6259]">
              {t('Farmeezy serves individual smallholders needing clear, field-level bio-control timing, while giving District Agricultural Officers the regional surveillance radar to deploy extension teams efficiently.')}
            </p>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-[22px] sm:rounded-[24px] border border-[#E3E1D9] bg-white p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between border-b border-[#E3E1D9] pb-4">
                <div>
                  <h4 className="text-[17px] sm:text-[18px] font-normal text-[#14231C]">{t('Select Persona Experience')}</h4>
                  <p className="text-[12px] text-[#5C6259] mt-0.5">{t('Explore the app from either stakeholder perspective.')}</p>
                </div>
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#F5F4F0] text-[#14231C] border border-[#E3E1D9]">
                  {t('Live Demo')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <Link href="/login">
                  <div className="p-4 rounded-2xl border border-[#E3E1D9] hover:border-[#14231C] bg-[#F5F4F0] hover:bg-[#EAE8E2] transition-all space-y-2 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium text-[#14231C]">{t('Farmer Portal')}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#14231C]" />
                    </div>
                    <p className="text-[12px] text-[#5C6259]">{t('Plot health, 7-day risk forecasting, spread simulation, and advisory.')}</p>
                  </div>
                </Link>

                <Link href="/login">
                  <div className="p-4 rounded-2xl border border-[#E3E1D9] hover:border-[#14231C] bg-[#F5F4F0] hover:bg-[#EAE8E2] transition-all space-y-2 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium text-[#14231C]">{t('Officer Portal')}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#14231C]" />
                    </div>
                    <p className="text-[12px] text-[#5C6259]">{t('District radar, DBSCAN cluster detection, and priority queue.')}</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
