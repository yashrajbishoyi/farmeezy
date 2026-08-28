'use client';

import React from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from '@/lib/context/LanguageContext';
import { LanguageCode } from '@/lib/translation/dictionary';

export function LanguageSelector({ className = '' }: { className?: string }) {
  const { language, setLanguage, supportedLanguages } = useTranslation();

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E3E1D9] bg-white text-[12px] text-[#14231C] shadow-none hover:border-[#14231C]/40 transition-colors">
        <Globe className="h-3.5 w-3.5 text-[#5C6259] shrink-0" />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as LanguageCode)}
          aria-label="Select interface language"
          className="bg-transparent text-[12px] font-medium text-[#14231C] focus:outline-none cursor-pointer pr-1"
        >
          {supportedLanguages.map((lang) => (
            <option key={lang.code} value={lang.code} className="text-[#14231C] bg-white">
              {lang.nativeName} ({lang.code.toUpperCase()})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
