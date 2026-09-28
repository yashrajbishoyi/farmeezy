'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sprout, 
  Shield, 
  ArrowRight,
  User,
  Phone,
  Lock,
  Mail,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth, UserRole } from '@/lib/context/AuthContext';
import { useTranslation } from '@/lib/context/LanguageContext';
import { DEMO_FARM_ID } from '@/lib/seeds/demo-farms';

export default function LoginPage() {
  const { user, loginAs, isLoading } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'personas' | 'credentials'>('personas');
  const [role, setRole] = useState<UserRole>('farmer');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto redirect if already logged in
  useEffect(() => {
    if (!isLoading && user) {
      const target = user.role === 'farmer' ? `/farm/${user.farmId || DEMO_FARM_ID}` : '/officer';
      router.replace(target);
    }
  }, [user, isLoading, router]);

  const handlePersonaLogin = (selectedRole: UserRole) => {
    setIsSubmitting(true);
    setErrorMessage('');
    loginAs(selectedRole);
  };

  const handleCustomFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMessage(t('Please enter your phone number or email address.'));
      return;
    }
    if (!password.trim()) {
      setErrorMessage(t('Please enter your password.'));
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    // Instant successful sign in with submitted details
    loginAs(role, fullName.trim() || undefined, identifier.trim());
  };

  if (isLoading || (user && isSubmitting)) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#14231C] text-white flex items-center justify-center mx-auto animate-spin">
          <Sprout className="w-6 h-6" />
        </div>
        <p className="text-[14px] text-[#5C6259]">{t('Authenticating & loading dashboard...')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-10 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <div className="text-[12px] uppercase tracking-[0.08em] text-[#5C6259] font-medium">
          {t('PORTAL ACCESS & AUTHENTICATION')}
        </div>
        <h1 className="text-[32px] sm:text-[42px] leading-[1.12] font-normal tracking-[-0.025em] text-[#14231C]">
          {t('Sign in to Farmeezy')}
        </h1>
        <p className="text-[14px] sm:text-[15px] leading-[1.6] text-[#5C6259]">
          {t('Select a demonstration persona below or sign in using your account credentials.')}
        </p>
      </div>

      {/* Tab Selector Pill Bar */}
      <div className="max-w-md mx-auto flex items-center gap-2 bg-white p-1.5 rounded-full border border-[#E3E1D9]">
        <button
          type="button"
          onClick={() => setActiveTab('personas')}
          className={`flex-1 py-2 px-4 rounded-full text-[13px] transition-all text-center ${
            activeTab === 'personas'
              ? 'bg-[#14231C] text-white font-medium shadow-none'
              : 'text-[#5C6259] hover:text-[#14231C]'
          }`}
        >
          {t('1-Click Demo Login')}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('credentials')}
          className={`flex-1 py-2 px-4 rounded-full text-[13px] transition-all text-center ${
            activeTab === 'credentials'
              ? 'bg-[#14231C] text-white font-medium shadow-none'
              : 'text-[#5C6259] hover:text-[#14231C]'
          }`}
        >
          {t('Mobile / Email Sign In')}
        </button>
      </div>

      {/* TAB 1: 1-CLICK DEMO PERSONAS */}
      {activeTab === 'personas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          
          {/* 1. Farmer Persona Card (Paper Surface) */}
          <div className="rounded-[24px] border border-[#E3E1D9] bg-white p-7 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
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
                <div className="mt-3 pt-3 border-t border-[#E3E1D9] text-[12px] text-[#5C6259] space-y-1">
                  <div className="flex items-center gap-1.5 text-[#2F9E5C]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Live 3.5 Acre Rice Plot Data</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#2F9E5C]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Multimodal Vision Leaf Diagnosis</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handlePersonaLogin('farmer')}
              className="w-full inline-flex items-center justify-center rounded-full bg-[#14231C] text-[#F5F4F0] hover:bg-[#23372E] py-3 px-5 text-[13px] font-medium transition-all group disabled:opacity-50"
            >
              <span>{isSubmitting ? t('Signing In...') : t('Continue as Farmer')}</span>
              <span className="w-4 h-4 rounded-full bg-white/20 group-hover:bg-white/30 transition-colors flex items-center justify-center ml-2.5">
                <ArrowRight className="w-2.5 h-2.5 text-white" />
              </span>
            </button>
          </div>

          {/* 2. Officer Persona Card (Dusk Green Contrast Surface) */}
          <div className="rounded-[24px] bg-[#1F3A2E] text-white p-7 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
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
                <div className="mt-3 pt-3 border-t border-white/15 text-[12px] text-[#C4CCC1] space-y-1">
                  <div className="flex items-center gap-1.5 text-[#8EFFB8]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>District Geospatial Surveillance Radar</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#8EFFB8]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>DBSCAN Outbreak Cluster Detection</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handlePersonaLogin('officer')}
              className="w-full inline-flex items-center justify-center rounded-full bg-white text-[#1F3A2E] hover:bg-[#F5F4F0] py-3 px-5 text-[13px] font-medium transition-all group disabled:opacity-50"
            >
              <span>{isSubmitting ? t('Signing In...') : t('Continue as Officer')}</span>
              <span className="w-4 h-4 rounded-full bg-[#1F3A2E]/10 group-hover:bg-[#1F3A2E]/20 transition-colors flex items-center justify-center ml-2.5">
                <ArrowRight className="w-2.5 h-2.5 text-[#1F3A2E]" />
              </span>
            </button>
          </div>

        </div>
      )}

      {/* TAB 2: CREDENTIALS FORM */}
      {activeTab === 'credentials' && (
        <div className="max-w-md mx-auto rounded-[24px] border border-[#E3E1D9] bg-white p-6 sm:p-8 space-y-5">
          <form onSubmit={handleCustomFormSubmit} className="space-y-4">
            
            {/* Role Selection */}
            <div>
              <label className="text-[11px] font-medium text-[#5C6259] uppercase block mb-1.5">
                {t('Select Portal Access Role')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('farmer')}
                  className={`py-2 px-3 rounded-xl border text-[13px] font-medium transition-all flex items-center justify-center gap-2 ${
                    role === 'farmer'
                      ? 'border-[#14231C] bg-[#14231C] text-white'
                      : 'border-[#E3E1D9] bg-[#F5F4F0] text-[#5C6259]'
                  }`}
                >
                  <Sprout className="w-4 h-4" />
                  <span>{t('Farmer')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('officer')}
                  className={`py-2 px-3 rounded-xl border text-[13px] font-medium transition-all flex items-center justify-center gap-2 ${
                    role === 'officer'
                      ? 'border-[#1F3A2E] bg-[#1F3A2E] text-white'
                      : 'border-[#E3E1D9] bg-[#F5F4F0] text-[#5C6259]'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>{t('Officer')}</span>
                </button>
              </div>
            </div>

            {/* Name Input */}
            <div>
              <label className="text-[11px] font-medium text-[#5C6259] uppercase block mb-1">
                {t('Full Name')}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#5C6259] absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="e.g. Ramesh Sahoo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-[13px] border border-[#E3E1D9] rounded-xl bg-[#F5F4F0] focus:outline-none focus:border-[#14231C]"
                />
              </div>
            </div>

            {/* Phone or Email Input */}
            <div>
              <label className="text-[11px] font-medium text-[#5C6259] uppercase block mb-1">
                {t('Mobile Number or Email')}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#5C6259] absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="+91 98765 43210 or user@farmeezy.in"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-[13px] border border-[#E3E1D9] rounded-xl bg-[#F5F4F0] focus:outline-none focus:border-[#14231C]"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="text-[11px] font-medium text-[#5C6259] uppercase block mb-1">
                {t('Password / OTP PIN')}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#5C6259] absolute left-3.5 top-3" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-[13px] border border-[#E3E1D9] rounded-xl bg-[#F5F4F0] focus:outline-none focus:border-[#14231C]"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-white border border-[#C13B3B] rounded-xl text-[12px] text-[#C13B3B] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#14231C] text-white hover:bg-[#23372E] py-3 rounded-full text-[13px] font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isSubmitting ? t('Signing In...') : t('Sign In & Open Dashboard')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Footnote */}
      <div className="text-center text-[12px] text-[#5C6259]">
        <span>Smart India Hackathon 2026 Demonstration Platform.</span>
      </div>
    </div>
  );
}
