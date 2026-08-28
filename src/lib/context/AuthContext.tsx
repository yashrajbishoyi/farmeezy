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
}

interface AuthContextType {
  user: AuthUser | null;
  loginAs: (role: UserRole) => void;
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
    // Read persisted login state from localStorage
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

  const loginAs = (role: UserRole) => {
    const selectedUser = role === 'farmer' ? FARMER_USER : OFFICER_USER;
    setUser(selectedUser);
    localStorage.setItem('farmeezy_auth_user', JSON.stringify(selectedUser));

    if (role === 'farmer') {
      router.push(`/farm/${DEMO_FARM_ID}`);
    } else {
      router.push('/officer');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('farmeezy_auth_user');
    router.push('/');
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
