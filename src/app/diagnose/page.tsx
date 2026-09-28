'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  FileImage, 
  RefreshCw,
  Sprout,
  ShieldCheck,
  Printer,
  Thermometer,
  Droplets,
  Wind,
  FlaskConical,
  Activity,
  Layers,
  FileText,
  Clock,
  TrendingDown,
  DollarSign
} from 'lucide-react';
import { Farm, FullPathologyTestResult, PathologyTestTelemetryInput } from '@/types';
import { DEMO_FARM_ID } from '@/lib/seeds/demo-farms';
import { CountUp } from '@/components/react-bits/CountUp';
import { FadeContent } from '@/components/react-bits/FadeContent';
import { useTranslation } from '@/lib/context/LanguageContext';

const DEMO_SAMPLES = [
  {
    id: 'sample-bacterial-blight',
    title: 'Bacterial Leaf Blight',
    crop: 'Rice',
    description: 'Yellow-orange wavy stripes along leaf margin',
    url: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=800&q=80',
    disease_id: 'bacterial_blight',
  },
  {
    id: 'sample-rice-blast',
    title: 'Rice Blast (Magnaporthe oryzae)',
    crop: 'Rice',
    description: 'Spindle-shaped elliptical lesions with gray-white centers',
    url: 'https://images.unsplash.com/photo-1599818816942-881b212f451f?auto=format&fit=crop&w=800&q=80',
    disease_id: 'rice_blast',
  },
  {
    id: 'sample-tomato-blight',
    title: 'Tomato Early Blight',
    crop: 'Tomato',
    description: 'Target-like concentric ring brown lesions',
    url: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb2250d?auto=format&fit=crop&w=800&q=80',
    disease_id: 'tomato_early_blight',
  },
  {
    id: 'sample-healthy-rice',
    title: 'Healthy Rice Foliage',
    crop: 'Rice',
    description: 'Uniform vibrant green tillers with zero lesion spots',
    url: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=800&q=80',
    disease_id: 'healthy',
  },
];

import { mockDb } from '@/lib/supabase/mock-db';

function DiagnoseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetFarmId = searchParams.get('farm_id') || DEMO_FARM_ID;
  const { t } = useTranslation();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [farms, setFarms] = useState<Farm[]>(() => mockDb.getFarms());
  const [selectedFarmId, setSelectedFarmId] = useState(targetFarmId);
  const [previewImage, setPreviewImage] = useState<string>(DEMO_SAMPLES[0].url);
  const [imageBase64, setImageBase64] = useState<string>('');
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState<'vision' | 'telemetry' | 'agronomy'>('vision');

  // Multi-Parameter Pathology Telemetry Form State
  const [telemetry, setTelemetry] = useState<PathologyTestTelemetryInput>({
    lesion_type: 'spindle_gray',
    tissue_location: 'lower_foliage',
    symptom_spread: 'moderate',
    temperature_c: 26.5,
    humidity_percent: 88,
    leaf_wetness_hours: 10,
    rainfall_24h_mm: 14.2,
    nitrogen_dose_kg_acre: 45,
    irrigation_mode: 'flood',
    growth_stage: 'Panicle Initiation',
  });

  const [testResult, setTestResult] = useState<FullPathologyTestResult | null>(null);

  useEffect(() => {
    fetchFarms();
  }, []);

  const fetchFarms = async () => {
    try {
      const res = await fetch('/api/farms');
      const data = await res.json();
      if (data.success && data.data) {
        setFarms(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAutoDetectTelemetry = async () => {
    const selectedFarm = farms.find(f => f.id === selectedFarmId);
    if (!selectedFarm) return;
    try {
      const res = await fetch(`/api/weather?farm_id=${selectedFarmId}`);
      const weatherData = await res.json();
      if (weatherData.success && weatherData.data?.current) {
        const curr = weatherData.data.current;
        setTelemetry(prev => ({
          ...prev,
          temperature_c: curr.temperature,
          humidity_percent: curr.humidity,
          rainfall_24h_mm: curr.rainfall,
          leaf_wetness_hours: curr.humidity >= 85 ? 12 : 6,
          growth_stage: selectedFarm.crop?.growth_stages?.[2]?.stage || 'Panicle Initiation',
        }));
      }
    } catch (err) {
      console.warn('Weather auto-detect fallback:', err);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 8 MB. Please select a smaller photo.');
      return;
    }

    setErrorMsg(null);
    setMimeType(file.type);

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      setImageBase64(base64String);
      setPreviewImage(reader.result as string);
      setTestResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleSelectSample = (sample: typeof DEMO_SAMPLES[0]) => {
    setPreviewImage(sample.url);
    setImageBase64('');
    setTestResult(null);
    setErrorMsg(null);
  };

  const runDiagnosis = async () => {
    setAnalyzing(true);
    setErrorMsg(null);
    setAnalysisStep(1);

    try {
      await new Promise(r => setTimeout(r, 400));
      setAnalysisStep(2);

      const selectedSample = DEMO_SAMPLES.find(s => s.url === previewImage);

      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farm_id: selectedFarmId,
          image_base64: imageBase64,
          image_url: previewImage,
          mime_type: mimeType,
          disease_id: selectedSample?.disease_id,
          telemetry,
        }),
      });

      const json = await res.json();

      setAnalysisStep(3);
      await new Promise(r => setTimeout(r, 400));

      if (json.success && json.data?.test_result) {
        setTestResult(json.data.test_result);
      } else {
        setErrorMsg(json.error || 'Diagnosis test failed. Please verify photo quality.');
      }
    } catch (err: any) {
      setErrorMsg('Error communicating with vision pathology AI. Please retry.');
    } finally {
      setAnalyzing(false);
      setAnalysisStep(0);
    }
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  const selectedFarm = farms.find(f => f.id === selectedFarmId) || farms[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E3E1D9] pb-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.08em] text-[#5C6259] font-medium mb-1">
            {t('MULTIMODAL PATHOLOGY & AGRONOMY DIAGNOSTIC SUITE')}
          </div>
          <h1 className="text-[28px] sm:text-[32px] font-normal text-[#14231C] tracking-tight">
            {t('Full-Stack Pathology Test')}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[13px]">
          <span className="text-[#5C6259]">{t('Target Plot:')}</span>
          <select
            value={selectedFarmId}
            onChange={(e) => {
              setSelectedFarmId(e.target.value);
              setTestResult(null);
            }}
            className="px-3.5 py-1.5 border border-[#E3E1D9] rounded-full text-[13px] font-medium bg-white focus:outline-none focus:border-[#14231C]"
          >
            {farms.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({t(f.crop?.name || f.crop_id)})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleAutoDetectTelemetry}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-[#E3E1D9] bg-[#F5F4F0] text-[12px] font-medium text-[#14231C] hover:bg-[#E3E1D9]"
          >
            <RefreshCw className="w-3 h-3 text-[#2F9E5C]" />
            <span>{t('Auto-Detect Telemetry')}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: 4-Section Multi-Parameter Test Inputs (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-[22px] border border-[#E3E1D9] bg-white p-6 space-y-5">
            
            {/* Input Section Tabs */}
            <div className="flex border-b border-[#E3E1D9] text-[12px] font-medium">
              <button
                type="button"
                onClick={() => setActiveTab('vision')}
                className={`py-2 px-3 border-b-2 font-medium transition-colors ${
                  activeTab === 'vision'
                    ? 'border-[#14231C] text-[#14231C]'
                    : 'border-transparent text-[#5C6259] hover:text-[#14231C]'
                }`}
              >
                1. Foliage Photo
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('telemetry')}
                className={`py-2 px-3 border-b-2 font-medium transition-colors ${
                  activeTab === 'telemetry'
                    ? 'border-[#14231C] text-[#14231C]'
                    : 'border-transparent text-[#5C6259] hover:text-[#14231C]'
                }`}
              >
                2. Micro-Climate
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('agronomy')}
                className={`py-2 px-3 border-b-2 font-medium transition-colors ${
                  activeTab === 'agronomy'
                    ? 'border-[#14231C] text-[#14231C]'
                    : 'border-transparent text-[#5C6259] hover:text-[#14231C]'
                }`}
              >
                3. Agronomy & Urea
              </button>
            </div>

            {/* TAB 1: Foliage Photo Upload & Symptoms */}
            {activeTab === 'vision' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-medium text-[#14231C]">Crop Foliage Photo</span>
                  <span className="text-[11px] text-[#5C6259]">JPG, PNG &lt; 8MB</span>
                </div>

                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative aspect-square w-full rounded-[18px] overflow-hidden cursor-pointer transition-all border border-[#E3E1D9] group ${
                    isDragOver
                      ? 'bg-[#E3E1D9]/40 border-[#14231C]'
                      : 'bg-[#F5F4F0] hover:border-[#14231C]/50'
                  }`}
                >
                  <img
                    src={previewImage || 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=800&q=80'}
                    alt="Crop foliage placeholder"
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-black/65 backdrop-blur-sm px-3.5 py-2 rounded-xl text-white text-[11px]">
                    <div className="flex items-center gap-1.5 truncate">
                      <Camera className="w-3.5 h-3.5 text-[#2F9E5C] shrink-0" />
                      <span className="truncate">{t('Crop Foliage Preview · Click to Replace')}</span>
                    </div>
                    <span className="text-white/70 text-[10px] shrink-0">{t('Upload')}</span>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />

                <div className="space-y-3 pt-2 border-t border-[#E3E1D9]">
                  <div>
                    <label className="text-[11px] font-medium text-[#5C6259] uppercase block mb-1">
                      Observed Lesion Morphology
                    </label>
                    <select
                      value={telemetry.lesion_type}
                      onChange={(e) => setTelemetry({ ...telemetry, lesion_type: e.target.value as any })}
                      className="w-full px-3 py-1.5 text-[12px] border border-[#E3E1D9] rounded-lg bg-white"
                    >
                      <option value="spindle_gray">Spindle-shaped gray-white centered lesions</option>
                      <option value="yellow_wavy">Yellow-orange wavy margin stripes</option>
                      <option value="concentric_brown">Target-like concentric brown rings</option>
                      <option value="oval_sheath">Oval greenish-gray water-soaked spots</option>
                      <option value="none">No visible spots / Clean foliage</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-[#5C6259] uppercase block mb-1">
                      Affected Tissue Zone
                    </label>
                    <select
                      value={telemetry.tissue_location}
                      onChange={(e) => setTelemetry({ ...telemetry, tissue_location: e.target.value as any })}
                      className="w-full px-3 py-1.5 text-[12px] border border-[#E3E1D9] rounded-lg bg-white"
                    >
                      <option value="lower_foliage">Lower Canopy Foliage</option>
                      <option value="upper_canopy">Upper Active Leaves</option>
                      <option value="leaf_sheath">Leaf Sheath near soil line</option>
                      <option value="panicle_neck">Panicle Neck / Heading stage</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Micro-Climate & Field Environment Telemetry */}
            {activeTab === 'telemetry' && (
              <div className="space-y-4">
                <span className="text-[12px] font-medium text-[#14231C] block border-b border-[#E3E1D9] pb-2">
                  Micro-Climate Telemetry Inputs
                </span>

                <div className="space-y-3 text-[12px]">
                  <div>
                    <div className="flex justify-between text-[11px] text-[#5C6259] font-medium mb-1">
                      <span>Ambient Temperature (°C)</span>
                      <span className="text-[#14231C] font-semibold">{telemetry.temperature_c}°C</span>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="40"
                      step="0.5"
                      value={telemetry.temperature_c}
                      onChange={(e) => setTelemetry({ ...telemetry, temperature_c: parseFloat(e.target.value) })}
                      className="w-full accent-[#14231C]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-[#5C6259] font-medium mb-1">
                      <span>Relative Ambient Humidity (%)</span>
                      <span className="text-[#14231C] font-semibold">{telemetry.humidity_percent}%</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="100"
                      value={telemetry.humidity_percent}
                      onChange={(e) => setTelemetry({ ...telemetry, humidity_percent: parseInt(e.target.value) })}
                      className="w-full accent-[#14231C]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-[#5C6259] font-medium mb-1">
                      <span>Leaf Wetness Duration (Continuous Dew/Rain Hours)</span>
                      <span className="text-[#14231C] font-semibold">{telemetry.leaf_wetness_hours} hrs</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="24"
                      value={telemetry.leaf_wetness_hours}
                      onChange={(e) => setTelemetry({ ...telemetry, leaf_wetness_hours: parseInt(e.target.value) })}
                      className="w-full accent-[#14231C]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-[#5C6259] uppercase block mb-1">
                      24h Precipitation (mm)
                    </label>
                    <input
                      type="number"
                      value={telemetry.rainfall_24h_mm}
                      onChange={(e) => setTelemetry({ ...telemetry, rainfall_24h_mm: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 border border-[#E3E1D9] rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Agronomic Fertilizer & Crop Stage */}
            {activeTab === 'agronomy' && (
              <div className="space-y-4">
                <span className="text-[12px] font-medium text-[#14231C] block border-b border-[#E3E1D9] pb-2">
                  Agronomic Crop Stress Parameters
                </span>

                <div className="space-y-3 text-[12px]">
                  <div>
                    <label className="text-[11px] font-medium text-[#5C6259] uppercase block mb-1">
                      Split Nitrogen / Urea Dose Applied (kg/acre in last 14d)
                    </label>
                    <input
                      type="number"
                      value={telemetry.nitrogen_dose_kg_acre}
                      onChange={(e) => setTelemetry({ ...telemetry, nitrogen_dose_kg_acre: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 border border-[#E3E1D9] rounded-lg bg-white"
                    />
                    <span className="text-[10px] text-[#5C6259] block mt-1">
                      High split urea (&gt;35 kg/acre) increases succulent tissue susceptibility.
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-[#5C6259] uppercase block mb-1">
                      Field Irrigation / Drainage Method
                    </label>
                    <select
                      value={telemetry.irrigation_mode}
                      onChange={(e) => setTelemetry({ ...telemetry, irrigation_mode: e.target.value as any })}
                      className="w-full px-3 py-1.5 text-[12px] border border-[#E3E1D9] rounded-lg bg-white"
                    >
                      <option value="flood">Submerged Floodwater (High spore dispersal)</option>
                      <option value="drip">Precision Drip Irrigation</option>
                      <option value="rainfed">Rainfed Plot</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-[#5C6259] uppercase block mb-1">
                      Crop Growth Stage
                    </label>
                    <select
                      value={telemetry.growth_stage}
                      onChange={(e) => setTelemetry({ ...telemetry, growth_stage: e.target.value })}
                      className="w-full px-3 py-1.5 text-[12px] border border-[#E3E1D9] rounded-lg bg-white"
                    >
                      <option value="Seedling">Seedling Stage (Susceptibility: 0.3)</option>
                      <option value="Tillering">Tillering Stage (Susceptibility: 0.7)</option>
                      <option value="Panicle Initiation">Panicle Initiation (Susceptibility: 0.9)</option>
                      <option value="Flowering & Heading">Flowering & Heading (Susceptibility: 0.85)</option>
                      <option value="Ripening & Maturity">Ripening & Maturity (Susceptibility: 0.2)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-[#E3E1D9]">
              <button
                type="button"
                className="flex-1 rounded-full border border-[#E3E1D9] bg-white text-[#14231C] hover:bg-[#F5F4F0] py-2.5 text-[13px] font-medium transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {t('Browse File')}
              </button>

              <button
                type="button"
                disabled={analyzing}
                onClick={runDiagnosis}
                className="flex-1 rounded-full bg-[#14231C] text-white hover:bg-[#23372E] py-2.5 text-[13px] font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <span>{analyzing ? t('Testing...') : t('Run Full Pathology Test')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Stepper progress */}
            {analyzing && (
              <div className="p-3 bg-[#F5F4F0] rounded-xl border border-[#E3E1D9] text-[12px] text-[#14231C] space-y-1.5 animate-pulse">
                <div className="flex justify-between font-medium">
                  <span>
                    {analysisStep === 1 && '1/3 Pre-flight vision & microclimate validation...'}
                    {analysisStep === 2 && '2/3 Fusing nitrogen stress & agronomy matrix...'}
                    {analysisStep === 3 && '3/3 Building ICAR pathology certificate...'}
                  </span>
                  <span>{(analysisStep * 33.3).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-[#E3E1D9] rounded-full h-1 overflow-hidden">
                  <div
                    className="bg-[#14231C] h-full transition-all duration-300"
                    style={{ width: `${analysisStep * 33.3}%` }}
                  />
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-white border border-[#C13B3B] rounded-xl text-[12px] text-[#C13B3B] flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>{errorMsg}</p>
              </div>
            )}
          </div>

          {/* Quick Demo Sample Selector */}
          <div className="rounded-[22px] border border-[#E3E1D9] bg-white p-6 space-y-3">
            <span className="text-[11px] uppercase tracking-[0.08em] text-[#5C6259] font-medium block">
              {t('Or Select Benchmark Pathology Samples:')}
            </span>
            <div className="space-y-2">
              {DEMO_SAMPLES.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className={`p-3 rounded-xl border text-[13px] cursor-pointer transition-all flex items-center justify-between ${
                    previewImage === sample.url
                      ? 'border-[#14231C] bg-[#F5F4F0] text-[#14231C] font-medium'
                      : 'border-[#E3E1D9] hover:border-[#14231C]/40 bg-white text-[#5C6259]'
                  }`}
                >
                  <div>
                    <strong className="block text-[13px] text-[#14231C] font-medium">{t(sample.title)}</strong>
                    <span className="text-[11px] text-[#5C6259] block truncate max-w-[200px]">
                      {sample.description}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#5C6259] px-2 py-0.5 rounded-full border border-[#E3E1D9] uppercase">
                    {t(sample.crop)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Full-Stack Pathology Test Report (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {testResult ? (
            <FadeContent duration={0.3} className="space-y-6">
              
              {/* Printable ICAR Pathology Certificate Card */}
              <div className="rounded-[22px] border border-[#E3E1D9] bg-white p-7 sm:p-8 space-y-6 shadow-sm print:p-0 print:border-none print:shadow-none">
                
                {/* Certificate Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-[#E3E1D9] pb-4 gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-[#2F9E5C]" />
                      <span className="text-[11px] uppercase tracking-[0.08em] font-semibold text-[#14231C]">
                        AGRICULTURAL PATHOLOGY TEST CERTIFICATE
                      </span>
                    </div>
                    <h2 className="text-[24px] font-normal text-[#14231C] mt-1 capitalize">
                      {testResult.primary_disease_name}
                    </h2>
                    <span className="text-[12px] italic text-[#5C6259] block">
                      Pathogen: {testResult.scientific_pathogen_name} ({testResult.category.toUpperCase()})
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold ${
                      testResult.severity === 'critical' || testResult.severity === 'high'
                        ? 'bg-[#C13B3B] text-white'
                        : 'bg-[#E3E1D9] text-[#5C6259]'
                    }`}>
                      {testResult.severity.toUpperCase()} SEVERITY
                    </span>
                    <button
                      type="button"
                      onClick={handlePrintCertificate}
                      className="no-print text-[11px] font-medium text-[#14231C] hover:underline flex items-center gap-1"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Certificate</span>
                    </button>
                  </div>
                </div>

                {/* Test Metadata Banner */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F5F4F0] p-3.5 rounded-xl text-[11px] border border-[#E3E1D9]">
                  <div>
                    <span className="text-[#5C6259] block">Test ID</span>
                    <strong className="text-[#14231C] font-mono">{testResult.test_id}</strong>
                  </div>
                  <div>
                    <span className="text-[#5C6259] block">Target Crop</span>
                    <strong className="text-[#14231C]">{testResult.crop_name}</strong>
                  </div>
                  <div>
                    <span className="text-[#5C6259] block">Evaluated On</span>
                    <strong className="text-[#14231C]">{new Date(testResult.tested_at).toLocaleDateString()}</strong>
                  </div>
                  <div>
                    <span className="text-[#5C6259] block">Pathology Status</span>
                    <strong className="text-[#2F9E5C] font-medium">VERIFIED</strong>
                  </div>
                </div>

                {/* 4-Section Diagnostic Sub-score Matrix */}
                <div className="space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[12px] uppercase tracking-[0.08em] text-[#5C6259] font-medium">
                      Multi-Section Scoring Matrix
                    </span>
                    <div className="text-[13px] font-medium text-[#14231C]">
                      Composite Risk Grade: <strong className="text-[18px] text-[#C13B3B]">{testResult.section_scores.composite_risk_score}/100</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
                    <div className="p-3 bg-[#F5F4F0] rounded-xl border border-[#E3E1D9] space-y-1">
                      <div className="flex justify-between">
                        <span className="text-[#5C6259]">1. Vision AI Confidence</span>
                        <strong className="text-[#14231C]">{testResult.section_scores.vision_confidence}%</strong>
                      </div>
                      <div className="w-full bg-[#E3E1D9] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#14231C] h-full" style={{ width: `${testResult.section_scores.vision_confidence}%` }} />
                      </div>
                    </div>

                    <div className="p-3 bg-[#F5F4F0] rounded-xl border border-[#E3E1D9] space-y-1">
                      <div className="flex justify-between">
                        <span className="text-[#5C6259]">2. Microclimate Stress</span>
                        <strong className="text-[#14231C]">{testResult.section_scores.microclimate_score}%</strong>
                      </div>
                      <div className="w-full bg-[#E3E1D9] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#14231C] h-full" style={{ width: `${testResult.section_scores.microclimate_score}%` }} />
                      </div>
                    </div>

                    <div className="p-3 bg-[#F5F4F0] rounded-xl border border-[#E3E1D9] space-y-1">
                      <div className="flex justify-between">
                        <span className="text-[#5C6259]">3. Agronomic Urea Stress</span>
                        <strong className="text-[#14231C]">{testResult.section_scores.agronomic_vulnerability}%</strong>
                      </div>
                      <div className="w-full bg-[#E3E1D9] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#14231C] h-full" style={{ width: `${testResult.section_scores.agronomic_vulnerability}%` }} />
                      </div>
                    </div>

                    <div className="p-3 bg-[#F5F4F0] rounded-xl border border-[#E3E1D9] space-y-1">
                      <div className="flex justify-between">
                        <span className="text-[#5C6259]">4. Spore Vector Pressure</span>
                        <strong className="text-[#14231C]">{testResult.section_scores.regional_cluster_pressure}%</strong>
                      </div>
                      <div className="w-full bg-[#E3E1D9] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#14231C] h-full" style={{ width: `${testResult.section_scores.regional_cluster_pressure}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visual Morphological Evidence */}
                <div className="p-4 rounded-xl bg-[#F5F4F0] border border-[#E3E1D9] space-y-2">
                  <span className="text-[12px] uppercase tracking-[0.08em] text-[#5C6259] font-medium block">
                    Visual Morphological Evidence (Observed Traits):
                  </span>
                  <ul className="space-y-1.5 text-[13px] text-[#14231C]">
                    {testResult.visual_evidence.map((evidence, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#14231C] mt-2 shrink-0" />
                        <span>{evidence}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bio-Intervention Protocol */}
                <div className="p-4 rounded-xl bg-white border border-[#E3E1D9] space-y-3">
                  <span className="text-[12px] uppercase tracking-[0.08em] text-[#5C6259] font-medium block border-b border-[#E3E1D9] pb-2">
                    Actionable Bio-Intervention Protocol:
                  </span>
                  <div className="space-y-2 text-[13px] text-[#14231C]">
                    <div>
                      <strong className="text-[12px] text-[#C13B3B] block">Immediate Emergency Action (24 Hours):</strong>
                      <p className="text-[13px]">{testResult.action_plan.immediate_24h}</p>
                    </div>
                    <div>
                      <strong className="text-[12px] text-[#2F9E5C] block">Recommended Bio-Agent Spray:</strong>
                      <p className="text-[13px]">{testResult.action_plan.biological_agent}</p>
                    </div>
                    <div>
                      <strong className="text-[12px] text-[#5C6259] block">Cultural Care:</strong>
                      <p className="text-[13px]">{testResult.action_plan.cultural_care}</p>
                    </div>
                  </div>
                </div>

                {/* Economic Yield Loss & Revenue Protection Card */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-[#14231C] text-white text-[13px]">
                  <div>
                    <span className="text-[11px] text-white/70 block uppercase">Projected Yield Loss</span>
                    <strong className="text-[22px] font-semibold text-[#FF8A8A]">
                      {testResult.economic_impact.projected_yield_loss_percent}%
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-white/70 block uppercase">Potential Financial Loss</span>
                    <strong className="text-[22px] font-semibold text-[#FF8A8A]">
                      ₹{testResult.economic_impact.potential_financial_loss_inr.toLocaleString()}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-white/70 block uppercase">Protected Revenue</span>
                    <strong className="text-[22px] font-semibold text-[#8EFFB8]">
                      ₹{testResult.economic_impact.protected_net_revenue_inr.toLocaleString()}
                    </strong>
                  </div>
                </div>

                {/* Transition CTA */}
                <div className="pt-2 no-print">
                  <Link href={`/farm/${selectedFarmId}`}>
                    <button className="w-full rounded-full bg-[#14231C] text-white hover:bg-[#23372E] py-3 text-[14px] font-medium transition-all flex items-center justify-center gap-2 group">
                      <span>{t('View Live Outbreak Map & Treatment Simulation')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>

              </div>
            </FadeContent>
          ) : (
            <div className="rounded-[22px] border border-[#E3E1D9] bg-white p-12 text-center flex flex-col items-center justify-center min-h-[420px] space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#F5F4F0] border border-[#E3E1D9] flex items-center justify-center text-[#5C6259]">
                <FlaskConical className="h-7 w-7 text-[#2F9E5C]" />
              </div>
              <h3 className="text-[22px] font-normal text-[#14231C]">
                {t('Full-Stack Agricultural Pathology Suite')}
              </h3>
              <p className="text-[13px] text-[#5C6259] max-w-md">
                {t('Upload a leaf photo or pick a benchmark sample, configure the micro-climate & agronomy inputs, then click')} <strong>{t('Run Full Pathology Test')}</strong>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DiagnosePage() {
  const { t } = useTranslation();
  return (
    <Suspense fallback={<div className="max-w-5xl mx-auto p-12 text-center text-[13px] text-[#5C6259]">{t('Loading diagnostic suite...')}</div>}>
      <DiagnoseContent />
    </Suspense>
  );
}
