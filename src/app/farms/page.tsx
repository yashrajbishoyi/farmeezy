'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Sprout, 
  MapPin, 
  ArrowRight, 
  Plus, 
  Activity,
  CheckCircle2
} from 'lucide-react';
import { Farm, Crop } from '@/types';
import { DEMO_FARM_ID } from '@/lib/seeds/demo-farms';
import { useAuth } from '@/lib/context/AuthContext';
import { useTranslation } from '@/lib/context/LanguageContext';

import { mockDb } from '@/lib/supabase/mock-db';
import { SEED_CROPS } from '@/lib/seeds/crops';

export default function FarmsPage() {
  const [farms, setFarms] = useState<Farm[]>(() => mockDb.getFarms());
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  // Quick Farm Creation Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [crops, setCrops] = useState<Crop[]>(SEED_CROPS);
  const [newFarmName, setNewFarmName] = useState('');
  const [newFarmCrop, setNewFarmCrop] = useState('rice');
  const [newFarmArea, setNewFarmArea] = useState('2.5');
  const [newFarmSowingDate, setNewFarmSowingDate] = useState('2026-07-05');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchFarms();
    fetchCrops();
  }, []);

  const fetchFarms = async () => {
    try {
      const res = await fetch('/api/farms');
      const data = await res.json();
      if (data.success) {
        setFarms(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCrops = async () => {
    try {
      const res = await fetch('/api/crops');
      const data = await res.json();
      if (data.success) {
        setCrops(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFarmName) return;
    setCreating(true);
    try {
      const res = await fetch('/api/farms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFarmName,
          crop_id: newFarmCrop,
          area_acres: parseFloat(newFarmArea) || 1.0,
          sowing_date: newFarmSowingDate,
          lat: 20.4625 + (Math.random() - 0.5) * 0.1,
          lng: 85.8828 + (Math.random() - 0.5) * 0.1,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        setNewFarmName('');
        fetchFarms();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 sm:px-10 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E3E1D9] pb-5">
        <div>
          <div className="text-[11px] uppercase tracking-[0.08em] text-[#5C6259] font-medium mb-1">
            {t('FARMER WORKSPACE · PLOT SELECTION')}
          </div>
          <h1 className="text-[28px] sm:text-[34px] font-normal text-[#14231C] tracking-tight">
            {t('Select a Monitored Farm')}
          </h1>
          <p className="text-[14px] text-[#5C6259] mt-0.5">
            {t('Choose an active agricultural plot to view real-time risk scores, weather, and spread simulations.')}
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center rounded-full bg-[#14231C] text-white hover:bg-[#23372E] px-5 py-2.5 text-[13px] font-medium transition-all"
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          {t('Register New Plot')}
        </button>
      </div>

      {/* Farms Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-48 rounded-[22px] bg-white border border-[#E3E1D9] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {farms.map((farm) => {
            const isDemo = farm.id === DEMO_FARM_ID;
            const riskValue = isDemo ? 81 : 18;
            const isCritical = riskValue >= 75;

            return (
              <div
                key={farm.id}
                className="rounded-[22px] border border-[#E3E1D9] bg-white p-6 space-y-4 flex flex-col justify-between hover:border-[#14231C]/40 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-[17px] font-medium text-[#14231C] truncate max-w-[200px]">
                        {farm.name}
                      </h3>
                      <p className="text-[12px] text-[#5C6259] mt-0.5">
                        {farm.lat.toFixed(2)}, {farm.lng.toFixed(2)} · Odisha
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                      isCritical ? 'bg-[#C13B3B] text-white' : 'bg-[#E3E1D9] text-[#5C6259]'
                    }`}>
                      {riskValue}/100 {isCritical ? t('Critical') : t('Low')}
                    </span>
                  </div>

                  <div className="p-3 bg-[#F5F4F0] rounded-xl border border-[#E3E1D9] text-[12px] text-[#5C6259] space-y-1">
                    <p>{t('Crop:')} <span className="text-[#14231C] font-medium">{t(farm.crop?.name || farm.crop_id)}</span> ({farm.variety || 'Standard'})</p>
                    <p>{t('Area:')} <span className="text-[#14231C] font-medium">{farm.area_acres} {t('Acres')}</span> · {t('Sown')} {farm.sowing_date}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E3E1D9] flex items-center justify-between">
                  <Link href={`/diagnose?farm_id=${farm.id}`} className="text-[12px] text-[#5C6259] hover:text-[#14231C] transition-colors">
                    {t('AI Diagnosis')}
                  </Link>
                  <Link href={`/farm/${farm.id}`}>
                    <button className="inline-flex items-center rounded-full bg-[#14231C] text-white hover:bg-[#23372E] px-4 py-1.5 text-[12px] font-medium transition-all group">
                      <span>{t('Open Health')}</span>
                      <ArrowRight className="w-3 h-3 ml-1.5" />
                    </button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Add Farm Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#14231C]/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-[24px] border border-[#E3E1D9] p-7 space-y-5 shadow-sm">
            <div>
              <h3 className="text-[20px] font-normal text-[#14231C]">{t('Register New Farm')}</h3>
              <p className="text-[13px] text-[#5C6259] mt-0.5">{t('Enter plot details to initiate predictive risk monitoring.')}</p>
            </div>
            
            <form onSubmit={handleCreateFarm} className="space-y-4 text-[13px]">
              <div>
                <label className="font-medium text-[#14231C] block mb-1">{t('Farm Name')}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mahanga North Plot"
                  value={newFarmName}
                  onChange={(e) => setNewFarmName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#E3E1D9] rounded-xl text-[13px] focus:outline-none focus:border-[#14231C] bg-[#F5F4F0]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-[#14231C] block mb-1">{t('Crop Type')}</label>
                  <select
                    value={newFarmCrop}
                    onChange={(e) => setNewFarmCrop(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#E3E1D9] rounded-xl text-[13px] focus:outline-none focus:border-[#14231C] bg-[#F5F4F0]"
                  >
                    {crops.map((c) => (
                      <option key={c.id} value={c.id}>{t(c.name)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-medium text-[#14231C] block mb-1">{t('Area (Acres)')}</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newFarmArea}
                    onChange={(e) => setNewFarmArea(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#E3E1D9] rounded-xl text-[13px] focus:outline-none focus:border-[#14231C] bg-[#F5F4F0]"
                  />
                </div>
              </div>
              <div>
                <label className="font-medium text-[#14231C] block mb-1">{t('Sowing Date')}</label>
                <input
                  type="date"
                  required
                  value={newFarmSowingDate}
                  onChange={(e) => setNewFarmSowingDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#E3E1D9] rounded-xl text-[13px] focus:outline-none focus:border-[#14231C] bg-[#F5F4F0]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-full px-4 py-2 text-[13px] text-[#5C6259] hover:text-[#14231C]"
                >
                  {t('Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-full bg-[#14231C] text-white px-5 py-2 text-[13px] font-medium hover:bg-[#23372E] disabled:opacity-50"
                >
                  {creating ? t('Analyzing...') : t('Create Farm')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
