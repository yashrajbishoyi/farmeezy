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

export function BottomNav() {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  // Hide bottom nav on landing page, login page, or before explicit authentication
  if (!user || isLoading || pathname === '/' || pathname === '/login') {
    return null;
  }

  if (user.role === 'officer') {
    return (
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E3E1D9] py-2 px-6 flex items-center justify-around shadow-sm">
        <Link
          href="/officer"
          className={`flex flex-col items-center py-1 px-4 rounded-xl text-[11px] transition-colors ${
            pathname === '/officer' ? 'text-[#14231C] font-semibold' : 'text-[#5C6259]'
          }`}
        >
          <Shield className="h-5 w-5 mb-0.5" />
          <span>District</span>
        </Link>
        <Link
          href="/map"
          className={`flex flex-col items-center py-1 px-4 rounded-xl text-[11px] transition-colors ${
            pathname === '/map' ? 'text-[#14231C] font-semibold' : 'text-[#5C6259]'
          }`}
        >
          <MapIcon className="h-5 w-5 mb-0.5" />
          <span>Radar</span>
        </Link>
      </div>
    );
  }

  const farmerNavItems = [
    { href: `/farm/${user.farmId || DEMO_FARM_ID}`, label: 'Health', icon: Home },
    { href: '/diagnose', label: 'Diagnose', icon: Activity },
    { href: '/map', label: 'Radar', icon: MapIcon },
    { href: '/simulate', label: 'Simulator', icon: PlayCircle },
    { href: '/assistant', label: 'Advisor', icon: MessageSquare },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E3E1D9] py-1.5 px-3 flex items-center justify-between shadow-sm">
      {farmerNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl text-[11px] transition-colors ${
              isActive ? 'text-[#14231C] font-semibold' : 'text-[#5C6259]'
            }`}
          >
            <Icon className="h-4 w-4 mb-0.5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
