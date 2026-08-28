'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sprout, ArrowRight, LogOut } from 'lucide-react';
import { DEMO_FARM_ID } from '@/lib/seeds/demo-farms';
import { useAuth } from '@/lib/context/AuthContext';
import { useTranslation } from '@/lib/context/LanguageContext';
import { LanguageSelector } from '@/components/layout/LanguageSelector';

export function Navbar() {
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLandingPage = pathname === '/';
  // Strictly only show authenticated navigation links when user is confirmed logged in and NOT on the public landing page
  const showAuthLinks = mounted && !isLoading && user && !isLandingPage;

  const farmerLinks = [
    { href: `/farm/${user?.farmId || DEMO_FARM_ID}`, label: t('Farm Health') },
    { href: '/diagnose', label: t('Diagnose') },
    { href: '/map', label: t('Risk Map') },
    { href: '/simulate', label: t('Simulator') },
    { href: '/assistant', label: t('Advisor') },
  ];

  const officerLinks = [
    { href: '/officer', label: t('District Portal') },
    { href: '/map', label: t('Surveillance Radar') },
  ];

  return (
    <header className="w-full bg-[#F5F4F0] pt-4 sm:pt-5 pb-3.5 sm:pb-4 px-4 sm:px-10 border-b border-[#E3E1D9]/60">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand: Line Icon + Wordmark */}
        <Link href="/" className="flex items-center gap-2 text-[#14231C] group">
          <Sprout className="h-5 w-5 stroke-[1.75] text-[#14231C]" />
          <span className="text-[17px] font-normal tracking-tight text-[#14231C]">Farmeezy</span>
        </Link>

        {/* Center Navigation Links: ONLY rendered when explicitly authenticated on an internal dashboard page */}
        {showAuthLinks && user && (
          <nav className="hidden md:flex items-center space-x-6 text-[14px]">
            {user.role === 'farmer' && (
              farmerLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`transition-colors duration-150 ${
                      isActive
                        ? 'text-[#14231C] font-medium'
                        : 'text-[#5C6259] hover:text-[#14231C]'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })
            )}

            {user.role === 'officer' && (
              officerLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`transition-colors duration-150 ${
                      isActive
                        ? 'text-[#14231C] font-medium'
                        : 'text-[#5C6259] hover:text-[#14231C]'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })
            )}
          </nav>
        )}

        {/* Right Action: Language Selector + Sign In Pill OR Logged-in Profile + Logout */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {mounted && <LanguageSelector />}

          {(!mounted || isLoading || !user || isLandingPage) ? (
            <Link href="/login">
              <button className="inline-flex items-center justify-center rounded-full bg-[#14231C] text-[#F5F4F0] hover:bg-[#23372E] px-5 py-2 text-[13px] font-medium transition-all group shadow-none">
                <span>{t('Sign In')}</span>
                <span className="w-4 h-4 rounded-full bg-white/15 group-hover:bg-white/25 transition-colors flex items-center justify-center ml-2 shrink-0">
                  <ArrowRight className="w-2.5 h-2.5 text-[#F5F4F0]" />
                </span>
              </button>
            </Link>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#E3E1D9] bg-white text-[12px] text-[#14231C]">
                <span className="w-2 h-2 rounded-full bg-[#2F9E5C]" />
                <span className="font-medium">{user.name}</span>
                <span className="text-[#5C6259]">({user.role === 'farmer' ? t('Farmer') : t('Officer')})</span>
              </div>
              
              <button
                onClick={logout}
                title={t('Sign Out')}
                className="w-8 h-8 rounded-full border border-[#E3E1D9] bg-white flex items-center justify-center text-[#5C6259] hover:text-[#14231C] hover:bg-[#F5F4F0] transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
