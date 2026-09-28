'use client';

import React, { useState, useEffect } from 'react';
import { Download, Share, X, Smartphone, WifiOff, CheckCircle2, ShieldCheck, PlusSquare } from 'lucide-react';
import { useTranslation } from '@/lib/context/LanguageContext';

export function PWAInstallPrompt() {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // 1. Service Worker Registration
    if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'test') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('[PWA] Service Worker registered:', reg.scope);
          })
          .catch((err) => {
            console.warn('[PWA] Service Worker registration failed:', err);
          });
      });
    }

    // 2. Offline / Online network status detection
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    // 3. Standalone mode check (PWA already installed)
    const isInStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isInStandalone);

    if (isInStandalone) return;

    // 4. iOS Detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Check if dismissed previously
    const isDismissed = localStorage.getItem('farmeezy_pwa_dismissed');

    // 5. Catch Android Chrome / Edge beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isDismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 6. Show iOS banner after 3s if not dismissed and not in standalone
    if (isIosDevice && !isDismissed && !isInStandalone) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3500);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('farmeezy_pwa_dismissed', 'true');
  };

  if (isStandalone) return null;

  return (
    <>
      {/* Offline Status Pill Notification */}
      {isOffline && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 bg-[#C13B3B] text-white px-4 py-1.5 rounded-full text-[12px] font-medium flex items-center gap-2 shadow-lg animate-bounce">
          <WifiOff className="w-3.5 h-3.5" />
          <span>{t('Offline Mode — Working from Cached Telemetry')}</span>
        </div>
      )}

      {/* Floating Bottom PWA Install Banner */}
      {showPrompt && (
        <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 bg-[#14231C] text-white p-4 sm:p-5 rounded-[22px] shadow-2xl border border-[#23372E] space-y-3 transition-all animate-in fade-in slide-in-from-bottom-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-[14px] font-medium text-white leading-tight">
                  {t('Install Farmeezy Web App')}
                </h4>
                <p className="text-[12px] text-[#A3ABA0] mt-0.5">
                  {isIOS
                    ? t('Add to iPhone / iPad home screen for instant full-screen offline access.')
                    : t('Install native app on Android with 1-tap for offline radar & diagnostics.')}
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-white/60 hover:text-white p-1 transition-colors shrink-0"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleInstallClick}
              className="flex-1 bg-white text-[#14231C] hover:bg-[#F5F4F0] py-2.5 px-4 rounded-full text-[13px] font-medium transition-all flex items-center justify-center gap-2"
            >
              {isIOS ? (
                <>
                  <Share className="w-3.5 h-3.5 text-[#14231C]" />
                  <span>{t('How to Install on iOS')}</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-[#14231C]" />
                  <span>{t('Install App')}</span>
                </>
              )}
            </button>

            <button
              onClick={handleDismiss}
              className="px-4 py-2.5 rounded-full border border-white/20 text-white/80 hover:text-white hover:bg-white/10 text-[12px] transition-colors"
            >
              {t('Not Now')}
            </button>
          </div>
        </div>
      )}

      {/* iOS Safari "Add to Home Screen" Instructional Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white text-[#14231C] w-full max-w-md rounded-[26px] p-6 sm:p-7 space-y-5 shadow-2xl animate-in fade-in slide-in-from-bottom-8">
            <div className="flex items-center justify-between border-b border-[#E3E1D9] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#14231C] text-white flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-[17px] font-medium text-[#14231C]">
                    {t('Install Farmeezy on iOS')}
                  </h3>
                  <span className="text-[11px] text-[#5C6259]">Safari Web App Instructions</span>
                </div>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="text-[#5C6259] hover:text-[#14231C] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-[13px] text-[#14231C]">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#F5F4F0] border border-[#E3E1D9]">
                <span className="w-6 h-6 rounded-full bg-[#14231C] text-white text-[12px] font-semibold flex items-center justify-center shrink-0">
                  1
                </span>
                <div>
                  <strong className="block text-[#14231C]">{t('Tap the Share Button')}</strong>
                  <p className="text-[12px] text-[#5C6259] mt-0.5">
                    {t('At the bottom of your Safari browser bar, tap the Share icon')} (<Share className="w-3.5 h-3.5 inline mx-0.5 text-[#14231C]" />).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#F5F4F0] border border-[#E3E1D9]">
                <span className="w-6 h-6 rounded-full bg-[#14231C] text-white text-[12px] font-semibold flex items-center justify-center shrink-0">
                  2
                </span>
                <div>
                  <strong className="block text-[#14231C]">{t('Select "Add to Home Screen"')}</strong>
                  <p className="text-[12px] text-[#5C6259] mt-0.5">
                    {t('Scroll down the menu options and select')} <span className="font-semibold text-[#14231C]">"{t('Add to Home Screen')}"</span> (<PlusSquare className="w-3.5 h-3.5 inline mx-0.5" />).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#F5F4F0] border border-[#E3E1D9]">
                <span className="w-6 h-6 rounded-full bg-[#14231C] text-white text-[12px] font-semibold flex items-center justify-center shrink-0">
                  3
                </span>
                <div>
                  <strong className="block text-[#14231C]">{t('Launch Farmeezy App')}</strong>
                  <p className="text-[12px] text-[#5C6259] mt-0.5">
                    {t('Tap "Add" in top right. Open Farmeezy from your Home Screen for full-screen offline experience!')}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowIOSModal(false);
                setShowPrompt(false);
                localStorage.setItem('farmeezy_pwa_dismissed', 'true');
              }}
              className="w-full bg-[#14231C] text-white hover:bg-[#23372E] py-3 rounded-full text-[13px] font-medium transition-colors"
            >
              {t('Got It')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
