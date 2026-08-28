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
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Crop } from '@/types';

const PRESET_LOCATIONS = [
  { label: 'Cuttack Basin (Central Odisha)', lat: 20.4625, lng: 85.8828 },
  { label: 'Khordha Valley (Bhubaneswar)', lat: 20.1800, lng: 85.6200 },
  { label: 'Puri Coastal Belt', lat: 19.8135, lng: 85.8312 },
  { label: 'Balasore Delta', lat: 21.4950, lng: 86.9320 },
  { label: 'Sambalpur Canal Area', lat: 21.4669, lng: 83.9812 },
];

export default function OnboardingPage() {
  const router = useRouter();
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
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-xl shadow-xl border-emerald-950/10 bg-white">
        <CardHeader className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white rounded-t-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-700/80 rounded-xl">
                <Sprout className="h-6 w-6 text-emerald-200" />
              </div>
              <div>
                <CardTitle className="text-xl text-white font-bold">Farmeezy Onboarding</CardTitle>
                <CardDescription className="text-emerald-100/80 text-xs">
                  Step {step} of 3 — Setup Your Farm Profile
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all ${
                    s === step ? 'w-6 bg-amber-400' : s < step ? 'w-2 bg-emerald-400' : 'w-2 bg-emerald-900'
                  }`}
                />
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Step 1: Location & Farm Name */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <label className="text-sm font-bold text-slate-800 block mb-1">
                  Farm / Plot Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Maa Tarini Paddy Field"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-800 block mb-1.5">
                  Select Agro-Climatic Zone / Location
                </label>
                <div className="space-y-2">
                  {PRESET_LOCATIONS.map((loc, idx) => (
                    <div
                      key={loc.label}
                      onClick={() => setSelectedLocIndex(idx)}
                      className={`p-3 rounded-lg border text-sm cursor-pointer transition-all flex items-center justify-between ${
                        selectedLocIndex === idx
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-semibold ring-1 ring-emerald-500'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className={`h-4 w-4 ${selectedLocIndex === idx ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <span>{loc.label}</span>
                      </div>
                      <span className="text-xs text-slate-400">
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
                <label className="text-sm font-bold text-slate-800 block mb-1.5">
                  Select Monitored Crop
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {crops.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCropId(c.id)}
                      className={`p-3.5 rounded-lg border text-sm cursor-pointer transition-all ${
                        selectedCropId === c.id
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-500'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <span className="block">{c.name}</span>
                      <span className="text-[11px] text-slate-400 italic block mt-0.5">{c.scientific_name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-800 block mb-1">
                  Variety / Cultivar
                </label>
                <input
                  type="text"
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  placeholder="e.g. Swarna, Pooja, Lalat, MTU 1010"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Step 3: Area & Sowing Date */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-slate-800 block mb-1">
                    Field Area (Acres)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={areaAcres}
                    onChange={(e) => setAreaAcres(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Used for economic yield loss modeling</p>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-800 block mb-1">
                    Sowing Date
                  </label>
                  <input
                    type="date"
                    value={sowingDate}
                    onChange={(e) => setSowingDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Computes vulnerability stage</p>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                  <ShieldCheck className="h-4 w-4 text-emerald-700" />
                  What Farmeezy will predict automatically:
                </div>
                <ul className="text-xs text-emerald-800 space-y-1 list-disc list-inside">
                  <li>Current Growth Stage & Pathogen Susceptibility Index</li>
                  <li>Live Micro-climate & 7-Day Rainfall/Humidity Forecast</li>
                  <li>Regional Outbreak Pressure from nearby monitored plots</li>
                  <li>Simulated Yield Loss & ROI of biological intervention</li>
                </ul>
              </div>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {step > 1 ? (
              <Button variant="outline" size="sm" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Previous
              </Button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <Button variant="agri" size="sm" onClick={() => setStep(step + 1)}>
                Next Step
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            ) : (
              <Button variant="agri" size="sm" disabled={loading} onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700">
                <Sparkles className="mr-1.5 h-4 w-4 text-amber-300" />
                {loading ? 'Initializing Telemetry...' : 'Launch Farm Dashboard'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
