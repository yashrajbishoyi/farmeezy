'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  LanguageCode,
  SUPPORTED_LANGUAGES,
  translateText,
  TranslationResponse
} from '@/lib/translation/dictionary';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (text: string) => string;
  translateAsync: (text: string, targetLang?: LanguageCode) => Promise<string>;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('farmeezy_language') as LanguageCode;
      if (saved && ['en', 'hi', 'mr', 'or'].includes(saved)) {
        setLanguageState(saved);
      }
    } catch {
      // Ignore storage errors in restricted browser contexts
    }
  }, []);

  const setLanguage = useCallback((newLang: LanguageCode) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem('farmeezy_language', newLang);
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Synchronous offline translation using the built-in dictionary
  const t = useCallback(
    (text: string): string => {
      if (language === 'en' || !text) return text;
      const res = translateText(text, language);
      return res.translated_text;
    },
    [language]
  );

  // Asynchronous translation with endpoint fetch and offline fallback
  const translateAsync = useCallback(
    async (text: string, targetLang?: LanguageCode): Promise<string> => {
      const target = targetLang || language;
      if (target === 'en' || !text) return text;

      try {
        const res = await fetch('/api/translate/text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            target_lang: target,
          }),
        });
        if (res.ok) {
          const data = (await res.json()) as TranslationResponse;
          return data.translated_text;
        }
      } catch (e) {
        console.warn('Translate API fetch failed, falling back to local dictionary:', e);
      }

      // Offline dictionary fallback
      return translateText(text, target).translated_text;
    },
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        translateAsync,
        supportedLanguages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
