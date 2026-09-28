'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Activity, 
  Map as MapIcon, 
  MessageSquare,
  PlayCircle,
  Shield
} from 'lucide-react';
import { DEMO_FARM_ID } from '@/lib/seeds/demo-farms';
import { useAuth } from '@/lib/context/AuthContext';
import { useTranslation } from '@/lib/context/LanguageContext';

export function BottomNav() {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const { t } = useTranslation();

  // Hide bottom nav on landing page or login page before authentication
  if (!user || isLoading || pathname === '/' || pathname === '/login') {
    return null;
  }

  if (user.role === 'officer') {
    return (
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E3E1D9] pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] px-6 flex items-center justify-around shadow-lg">
        <Link
          href="/officer"
          className={`flex flex-col items-center py-1 px-4 rounded-xl text-[11px] transition-all active:scale-95 ${
            pathname === '/officer' ? 'text-[#14231C] font-semibold' : 'text-[#5C6259]'
          }`}
        >
          <Shield className={`h-5 w-5 mb-0.5 ${pathname === '/officer' ? 'text-[#14231C]' : 'text-[#5C6259]'}`} />
          <span>{t('District')}</span>
        </Link>
        <Link
          href="/map"
          className={`flex flex-col items-center py-1 px-4 rounded-xl text-[11px] transition-all active:scale-95 ${
            pathname === '/map' ? 'text-[#14231C] font-semibold' : 'text-[#5C6259]'
          }`}
        >
          <MapIcon className={`h-5 w-5 mb-0.5 ${pathname === '/map' ? 'text-[#14231C]' : 'text-[#5C6259]'}`} />
          <span>{t('Radar')}</span>
        </Link>
      </div>
    );
  }

  const farmerNavItems = [
    { href: `/farm/${user.farmId || DEMO_FARM_ID}`, label: t('Farm Health'), icon: Home },
    { href: '/diagnose', label: t('Diagnose'), icon: Activity },
    { href: '/map', label: t('Risk Map'), icon: MapIcon },
    { href: '/simulate', label: t('Simulator'), icon: PlayCircle },
    { href: '/assistant', label: t('Advisor'), icon: MessageSquare },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E3E1D9] pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] px-2 flex items-center justify-between shadow-lg">
      {farmerNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center py-1 px-2 rounded-xl text-[11px] transition-all active:scale-95 flex-1 ${
              isActive ? 'text-[#14231C] font-semibold' : 'text-[#5C6259]'
            }`}
          >
            <div className={`p-1 rounded-full transition-colors ${isActive ? 'bg-[#14231C]/10 text-[#14231C]' : ''}`}>
              <Icon className="h-4 w-4" />
            </div>
            <span className="truncate max-w-[64px] text-center mt-0.5">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
