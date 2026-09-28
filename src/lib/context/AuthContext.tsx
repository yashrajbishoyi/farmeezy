'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DEMO_FARM_ID } from '@/lib/seeds/demo-farms';

export type UserRole = 'farmer' | 'officer';

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  title: string;
  location: string;
  farmId?: string;
  emailOrPhone?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loginAs: (role: UserRole, customName?: string, identifier?: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const FARMER_USER: AuthUser = {
  id: 'usr_farmer_01',
  name: 'Ramesh Sahoo',
  role: 'farmer',
  title: 'Paddy Smallholder Farmer',
  location: 'Bidyadharpur, Cuttack, Odisha',
  farmId: DEMO_FARM_ID,
};

export const OFFICER_USER: AuthUser = {
  id: 'usr_officer_01',
  name: 'Dr. P. K. Mohapatra',
  role: 'officer',
  title: 'District Agricultural Officer / FPO Lead',
  location: 'Cuttack District, Odisha',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = localStorage.getItem('farmeezy_auth_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load auth user:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginAs = (role: UserRole, customName?: string, identifier?: string) => {
    const baseUser = role === 'farmer' ? FARMER_USER : OFFICER_USER;
    const selectedUser: AuthUser = {
      ...baseUser,
      name: customName && customName.trim() ? customName.trim() : baseUser.name,
      emailOrPhone: identifier || undefined,
    };

    setUser(selectedUser);
    localStorage.setItem('farmeezy_auth_user', JSON.stringify(selectedUser));

    const targetUrl = role === 'farmer' ? `/farm/${selectedUser.farmId || DEMO_FARM_ID}` : '/officer';
    
    // First attempt Next router navigation
    router.push(targetUrl);

    // Hard redirect fallback after small delay to guarantee navigation across all mobile/desktop browsers
    setTimeout(() => {
      if (typeof window !== 'undefined' && window.location.pathname === '/login') {
        window.location.href = targetUrl;
      }
    }, 150);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('farmeezy_auth_user');
    router.push('/');
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }, 150);
  };

  return (
    <AuthContext.Provider value={{ user, loginAs, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
