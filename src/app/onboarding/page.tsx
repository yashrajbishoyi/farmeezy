'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sprout, 
  MapPin, 
  Calendar, 
  Layers, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Sparkles,
  ShieldCheck 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Crop } from '@/types';
import { useTranslation } from '@/lib/context/LanguageContext';

const PRESET_LOCATIONS = [
  { label: 'Cuttack Basin (Central Odisha)', lat: 20.4625, lng: 85.8828 },
  { label: 'Khordha Valley (Bhubaneswar)', lat: 20.1800, lng: 85.6200 },
  { label: 'Puri Coastal Belt', lat: 19.8135, lng: 85.8312 },
  { label: 'Balasore Delta', lat: 21.4950, lng: 86.9320 },
  { label: 'Sambalpur Canal Area', lat: 21.4669, lng: 83.9812 },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [farmName, setFarmName] = useState('');
  const [selectedLocIndex, setSelectedLocIndex] = useState(0);
  const [selectedCropId, setSelectedCropId] = useState('rice');
  const [variety, setVariety] = useState('Swarna (MTU 7029)');
  const [areaAcres, setAreaAcres] = useState('3.0');
  const [sowingDate, setSowingDate] = useState('2026-07-01');

  useEffect(() => {
    fetchCrops();
  }, []);

  const fetchCrops = async () => {
    try {
      const res = await fetch('/api/crops');
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setCrops(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const selectedCrop = crops.find(c => c.id === selectedCropId) || crops[0];

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const loc = PRESET_LOCATIONS[selectedLocIndex];
      const res = await fetch('/api/farms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: farmName || `${loc.label.split(' ')[0]} ${selectedCrop?.name || 'Crop'} Field`,
          crop_id: selectedCropId,
          variety: variety,
          area_acres: parseFloat(areaAcres) || 2.0,
          sowing_date: sowingDate,
          lat: loc.lat,
          lng: loc.lng,
        }),
      });

      const json = await res.json();
      if (json.success && json.data?.id) {
        router.push(`/farm/${json.data.id}`);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Failed to create farm during onboarding:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-12 space-y-6">
      
      {/* Container Card */}
      <div className="rounded-[26px] border border-[#E3E1D9] bg-white overflow-hidden space-y-6 p-6 sm:p-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E3E1D9] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#14231C] text-white flex items-center justify-center shrink-0">
              <Sprout className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.08em] text-[#5C6259] font-medium">
                {t('PLOT REGISTRATION')}
              </div>
              <h1 className="text-[20px] font-normal text-[#14231C]">
                {t('Farm Onboarding')}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all ${
                  s === step ? 'w-6 bg-[#14231C]' : s < step ? 'w-2 bg-[#2F9E5C]' : 'w-2 bg-[#E3E1D9]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Location & Farm Name */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <label className="text-[12px] font-medium text-[#14231C] uppercase block mb-1">
                {t('Farm / Plot Name')}
              </label>
              <input
                type="text"
                placeholder="e.g. Maa Tarini Paddy Field"
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                className="w-full px-4 py-2.5 border border-[#E3E1D9] rounded-xl text-[13px] bg-[#F5F4F0] focus:outline-none focus:border-[#14231C]"
              />
            </div>

            <div>
              <label className="text-[12px] font-medium text-[#14231C] uppercase block mb-1.5">
                {t('Select Agro-Climatic Zone / Location')}
              </label>
              <div className="space-y-2">
                {PRESET_LOCATIONS.map((loc, idx) => (
                  <div
                    key={loc.label}
                    onClick={() => setSelectedLocIndex(idx)}
                    className={`p-3.5 rounded-xl border text-[13px] cursor-pointer transition-all flex items-center justify-between ${
                      selectedLocIndex === idx
                        ? 'border-[#14231C] bg-[#F5F4F0] text-[#14231C] font-medium'
                        : 'border-[#E3E1D9] hover:border-[#14231C]/40 text-[#5C6259] bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className={`h-4 w-4 ${selectedLocIndex === idx ? 'text-[#14231C]' : 'text-[#5C6259]'}`} />
                      <span>{loc.label}</span>
                    </div>
                    <span className="text-[11px] text-[#5C6259]">
                      {loc.lat.toFixed(2)}, {loc.lng.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Crop & Variety */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <label className="text-[12px] font-medium text-[#14231C] uppercase block mb-1.5">
                {t('Select Monitored Crop')}
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {crops.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCropId(c.id)}
                    className={`p-3.5 rounded-xl border text-[13px] cursor-pointer transition-all ${
                      selectedCropId === c.id
                        ? 'border-[#14231C] bg-[#F5F4F0] text-[#14231C] font-medium'
                        : 'border-[#E3E1D9] hover:border-[#14231C]/40 text-[#5C6259] bg-white'
                    }`}
                  >
                    <span className="block font-medium text-[#14231C]">{t(c.name)}</span>
                    <span className="text-[11px] text-[#5C6259] italic block mt-0.5">{c.scientific_name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[12px] font-medium text-[#14231C] uppercase block mb-1">
                {t('Variety / Cultivar')}
              </label>
              <input
                type="text"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                placeholder="e.g. Swarna, Pooja, Lalat, MTU 1010"
                className="w-full px-4 py-2.5 border border-[#E3E1D9] rounded-xl text-[13px] bg-[#F5F4F0] focus:outline-none focus:border-[#14231C]"
              />
            </div>
          </div>
        )}

        {/* Step 3: Area & Sowing Date */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[12px] font-medium text-[#14231C] uppercase block mb-1">
                  {t('Field Area (Acres)')}
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={areaAcres}
                  onChange={(e) => setAreaAcres(e.target.value)}
                  className="w-full px-4 py-2.5 border border-[#E3E1D9] rounded-xl text-[13px] bg-[#F5F4F0] focus:outline-none focus:border-[#14231C]"
                />
                <p className="text-[11px] text-[#5C6259] mt-1">{t('Used for economic yield loss modeling')}</p>
              </div>

              <div>
                <label className="text-[12px] font-medium text-[#14231C] uppercase block mb-1">
                  {t('Sowing Date')}
                </label>
                <input
                  type="date"
                  value={sowingDate}
                  onChange={(e) => setSowingDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-[#E3E1D9] rounded-xl text-[13px] bg-[#F5F4F0] focus:outline-none focus:border-[#14231C]"
                />
                <p className="text-[11px] text-[#5C6259] mt-1">{t('Computes vulnerability stage')}</p>
              </div>
            </div>

            <div className="p-4 bg-[#F5F4F0] rounded-xl border border-[#E3E1D9] space-y-2 text-[12px]">
              <div className="flex items-center gap-2 text-[#14231C] font-medium">
                <ShieldCheck className="h-4 w-4 text-[#2F9E5C]" />
                {t('What Farmeezy will predict automatically:')}
              </div>
              <ul className="text-[12px] text-[#5C6259] space-y-1 list-disc list-inside">
                <li>{t('Current Growth Stage & Pathogen Susceptibility Index')}</li>
                <li>{t('Live Micro-climate & 7-Day Rainfall/Humidity Forecast')}</li>
                <li>{t('Regional Outbreak Pressure from nearby monitored plots')}</li>
                <li>{t('Simulated Yield Loss & ROI of biological intervention')}</li>
              </ul>
            </div>
          </div>
        )}

        {/* Stepper Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E3E1D9]">
          {step > 1 ? (
            <Button variant="paper" size="sm" onClick={() => setStep(step - 1)}>
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              {t('Previous')}
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button variant="default" size="sm" onClick={() => setStep(step + 1)}>
              {t('Next Step')}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          ) : (
            <Button variant="default" size="sm" disabled={loading} onClick={handleSubmit}>
              <Sparkles className="mr-1.5 h-4 w-4 text-[#2F9E5C]" />
              {loading ? t('Initializing Telemetry...') : t('Launch Farm Dashboard')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
