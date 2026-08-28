'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Sprout, 
  Shield, 
  ArrowRight, 
  Phone, 
  Mail, 
  Lock,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { useTranslation } from '@/lib/context/LanguageContext';

export default function LoginPage() {
  const { loginAs } = useAuth();
  const { t } = useTranslation();
  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [authMode, setAuthMode] = useState<'persona' | 'email' | 'phone'>('persona');
  const [socialNotice, setSocialNotice] = useState<string | null>(null);

  const handleSocialAuth = (provider: string) => {
    setSocialNotice(`${provider} authentication selected. Connect your Firebase credentials in production.`);
  };

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

      {/* Social & Conventional Sign-In Section */}
      <div className="rounded-[24px] border border-[#E3E1D9] bg-white p-7 sm:p-8 space-y-6 max-w-xl mx-auto">
        <div className="text-center space-y-1">
          <span className="text-[11px] uppercase tracking-[0.08em] text-[#5C6259] font-medium block">
            {t('Or continue with third-party services')}
          </span>
        </div>

        {socialNotice && (
          <div className="p-3.5 bg-[#F5F4F0] border border-[#E3E1D9] rounded-xl text-[12px] text-[#14231C] flex items-center gap-2 animate-pulse">
            <CheckCircle2 className="h-4 w-4 text-[#2F9E5C] shrink-0" />
            <span>{socialNotice}</span>
          </div>
        )}

        <div className="space-y-3">
          {/* Google Sign-In Pill Button */}
          <button
            onClick={() => handleSocialAuth('Google')}
            className="w-full flex items-center justify-center gap-3 rounded-full border border-[#E3E1D9] bg-white hover:bg-[#F5F4F0] py-2.5 px-4 text-[13px] font-medium text-[#14231C] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{t('Continue with Google')}</span>
          </button>

          {/* Phone / Mobile OTP Pill Button */}
          <button
            onClick={() => handleSocialAuth('Phone OTP')}
            className="w-full flex items-center justify-center gap-3 rounded-full border border-[#E3E1D9] bg-white hover:bg-[#F5F4F0] py-2.5 px-4 text-[13px] font-medium text-[#14231C] transition-colors"
          >
            <Phone className="w-4 h-4 text-[#5C6259]" />
            <span>{t('Continue with Phone (SMS OTP)')}</span>
          </button>

          {/* Email / Password Option */}
          <button
            onClick={() => handleSocialAuth('Email')}
            className="w-full flex items-center justify-center gap-3 rounded-full border border-[#E3E1D9] bg-white hover:bg-[#F5F4F0] py-2.5 px-4 text-[13px] font-medium text-[#14231C] transition-colors"
          >
            <Mail className="w-4 h-4 text-[#5C6259]" />
            <span>{t('Continue with Email & Password')}</span>
          </button>
        </div>

        <div className="pt-2 text-center">
          <p className="text-[11px] text-[#5C6259]">
            Firebase Authentication client integration ready.
          </p>
        </div>
      </div>

      {/* Footnote */}
      <div className="text-center text-[12px] text-[#5C6259]">
        <span>Smart India Hackathon 2026 Demonstration Platform.</span>
      </div>
    </div>
  );
}
