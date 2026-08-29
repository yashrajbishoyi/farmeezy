'use client';

import React from 'react';
import { 
  Sprout, 
  Shield, 
  ArrowRight 
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { useTranslation } from '@/lib/context/LanguageContext';

export default function LoginPage() {
  const { loginAs } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-10 py-8 sm:py-12 space-y-8 sm:space-y-10">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <div className="text-[12px] uppercase tracking-[0.08em] text-[#5C6259] font-medium">
          {t('PORTAL ACCESS & AUTHENTICATION')}
        </div>
        <h1 className="text-[36px] sm:text-[44px] leading-[1.12] font-normal tracking-[-0.025em] text-[#14231C]">
          {t('Sign in to Farmeezy.')}
        </h1>
        <p className="text-[14px] sm:text-[15px] leading-[1.6] text-[#5C6259]">
          {t('Select a demonstration persona below or sign in using your account credentials.')}
        </p>
      </div>

      {/* Role Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        
        {/* 1. Farmer Persona Card (Paper Surface) */}
        <div className="rounded-[24px] border border-[#E3E1D9] bg-white p-7 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-full bg-[#F5F4F0] border border-[#E3E1D9] flex items-center justify-center text-[#14231C]">
                <Sprout className="h-5 w-5 stroke-[1.75]" />
              </span>
              <span className="text-[11px] uppercase tracking-[0.08em] px-2.5 py-0.5 rounded-full bg-[#F5F4F0] text-[#14231C] border border-[#E3E1D9] font-medium">
                {t('Farmer View')}
              </span>
            </div>

            <div>
              <h2 className="text-[20px] font-medium text-[#14231C]">
                {t('Farmer Portal')}
              </h2>
              <p className="text-[13px] text-[#5C6259] mt-0.5 font-normal">
                Ramesh Sahoo · Bidyadharpur Paddy Farm
              </p>
            </div>
          </div>

          <button
            onClick={() => loginAs('farmer')}
            className="w-full inline-flex items-center justify-center rounded-full bg-[#14231C] text-[#F5F4F0] hover:bg-[#23372E] py-3 px-5 text-[13px] font-medium transition-all group"
          >
            <span>{t('Continue as Farmer')}</span>
            <span className="w-4 h-4 rounded-full bg-white/20 group-hover:bg-white/30 transition-colors flex items-center justify-center ml-2.5">
              <ArrowRight className="w-2.5 h-2.5 text-white" />
            </span>
          </button>
        </div>

        {/* 2. Officer Persona Card (Dusk Green Contrast Surface) */}
        <div className="rounded-[24px] bg-[#1F3A2E] text-white p-7 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white">
                <Shield className="h-5 w-5 stroke-[1.75]" />
              </span>
              <span className="text-[11px] uppercase tracking-[0.08em] px-2.5 py-0.5 rounded-full bg-white/10 text-[#C4CCC1] border border-white/15 font-medium">
                {t('Officer View')}
              </span>
            </div>

            <div>
              <h2 className="text-[20px] font-medium text-white">
                {t('Agricultural Officer')}
              </h2>
              <p className="text-[13px] text-[#A3ABA0] mt-0.5 font-normal">
                Dr. P. K. Mohapatra · District Agronomist
              </p>
            </div>
          </div>

          <button
            onClick={() => loginAs('officer')}
            className="w-full inline-flex items-center justify-center rounded-full bg-white text-[#1F3A2E] hover:bg-[#F5F4F0] py-3 px-5 text-[13px] font-medium transition-all group"
          >
            <span>{t('Continue as Officer')}</span>
            <span className="w-4 h-4 rounded-full bg-[#1F3A2E]/10 group-hover:bg-[#1F3A2E]/20 transition-colors flex items-center justify-center ml-2.5">
              <ArrowRight className="w-2.5 h-2.5 text-[#1F3A2E]" />
            </span>
          </button>
        </div>

      </div>

      {/* Footnote */}
      <div className="text-center text-[12px] text-[#5C6259]">
        <span>Smart India Hackathon 2026 Demonstration Platform.</span>
      </div>
    </div>
  );
}
