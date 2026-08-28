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
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Farm, DiagnosisOutputContract } from '@/types';
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

function DiagnoseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetFarmId = searchParams.get('farm_id') || DEMO_FARM_ID;
  const { t } = useTranslation();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState(targetFarmId);
  const [previewImage, setPreviewImage] = useState<string>(DEMO_SAMPLES[0].url);
  const [imageBase64, setImageBase64] = useState<string>('');
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const [result, setResult] = useState<DiagnosisOutputContract | null>(null);

  useEffect(() => {
    fetchFarms();
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
      setResult(null);
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
    setResult(null);
    setErrorMsg(null);
  };

  const runDiagnosis = async () => {
    setAnalyzing(true);
    setErrorMsg(null);
    setAnalysisStep(1);

    try {
      await new Promise(r => setTimeout(r, 400));
      setAnalysisStep(2);

      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farm_id: selectedFarmId,
          image_base64: imageBase64,
          image_url: previewImage,
          mime_type: mimeType,
        }),
      });

      const json = await res.json();

      setAnalysisStep(3);
      await new Promise(r => setTimeout(r, 400));

      if (json.success) {
        setResult(json.data.analysis);
      } else {
        setErrorMsg(json.error || 'Diagnosis failed. Please check image clarity.');
      }
    } catch (err: any) {
      setErrorMsg('Error communicating with vision AI. Please retry.');
    } finally {
      setAnalyzing(false);
      setAnalysisStep(0);
    }
  };

  const selectedFarm = farms.find(f => f.id === selectedFarmId) || farms[0];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E3E1D9] pb-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.08em] text-[#5C6259] font-medium mb-1">
            {t('MULTIMODAL PATHOLOGY ANALYSIS')}
          </div>
          <h1 className="text-[28px] sm:text-[32px] font-normal text-[#14231C] tracking-tight">
            {t('Diagnose')}
          </h1>
        </div>

        <div className="flex items-center gap-2 text-[13px]">
          <span className="text-[#5C6259]">{t('Target Plot:')}</span>
          <select
            value={selectedFarmId}
            onChange={(e) => setSelectedFarmId(e.target.value)}
            className="px-3.5 py-1.5 border border-[#E3E1D9] rounded-full text-[13px] font-medium bg-white focus:outline-none focus:border-[#14231C]"
          >
            {farms.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({t(f.crop?.name || f.crop_id)})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Dropzone & Samples (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-[22px] border border-[#E3E1D9] bg-white p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E3E1D9] pb-3">
              <span className="text-[13px] font-medium text-[#14231C]">{t('1. Crop Foliage Photo')}</span>
              <span className="text-[11px] text-[#5C6259]">JPG, PNG &lt; 8MB</span>
            </div>

            {/* Designed Dropzone with Foliage Photo Preview */}
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
              
              {/* Overlay pill indicator */}
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

            <div className="flex gap-2 pt-1">
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
                <span>{analyzing ? t('Analyzing...') : t('Run Diagnosis')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Stepper progress */}
            {analyzing && (
              <div className="p-3 bg-[#F5F4F0] rounded-xl border border-[#E3E1D9] text-[12px] text-[#14231C] space-y-1.5 animate-pulse">
                <div className="flex justify-between font-medium">
                  <span>
                    {analysisStep === 1 && '1/3 Pre-flight image validation...'}
                    {analysisStep === 2 && '2/3 Multimodal feature extraction...'}
                    {analysisStep === 3 && '3/3 Fusing farm growth context...'}
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
              {t('Or Select Demo Benchmark Samples:')}
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

        {/* Right Column: Structured AI Diagnosis Output (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <FadeContent duration={0.3} className="space-y-6">
              {/* Primary Diagnosis Card */}
              <div className="rounded-[22px] border border-[#E3E1D9] bg-white p-7 sm:p-8 space-y-6">
                <div className="flex items-start justify-between border-b border-[#E3E1D9] pb-4">
                  <div>
                    <span className="text-[11px] uppercase tracking-[0.08em] text-[#5C6259] font-medium block">
                      {t('STRUCTURED DIAGNOSIS')}
                    </span>
                    <h2 className="text-[24px] font-normal text-[#14231C] mt-1 capitalize">
                      {t(result.primary_disease.replace(/_/g, ' '))}
                    </h2>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium ${
                    result.severity === 'high' || result.severity === 'critical' ? 'bg-[#C13B3B] text-white' : 'bg-[#E3E1D9] text-[#5C6259]'
                  }`}>
                    {t(result.severity.toUpperCase())} {t('SEVERITY')}
                  </span>
                </div>

                {/* Confidence & Quality Metrics */}
                <div className="grid grid-cols-2 gap-4 text-[13px]">
                  <div className="p-4 rounded-xl bg-[#F5F4F0] border border-[#E3E1D9] space-y-1">
                    <span className="text-[11px] text-[#5C6259] block">{t('Self-Assessed Confidence')}</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[28px] font-semibold text-[#14231C] tabular-nums">
                        <CountUp to={Math.round(result.confidence * 100)} duration={0.8} suffix="%" />
                      </span>
                      <span className="text-[11px] text-[#5C6259]">{t('certainty')}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#F5F4F0] border border-[#E3E1D9] space-y-1">
                    <span className="text-[11px] text-[#5C6259] block">{t('Image Quality Score')}</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[28px] font-semibold text-[#14231C] tabular-nums">
                        <CountUp to={Math.round(result.image_quality * 100)} duration={0.8} suffix="%" />
                      </span>
                      <span className="text-[11px] text-[#5C6259]">{t('resolution')}</span>
                    </div>
                  </div>
                </div>

                {/* Visual Evidence */}
                <div className="p-4 rounded-xl bg-[#F5F4F0] border border-[#E3E1D9] space-y-2">
                  <span className="text-[12px] uppercase tracking-[0.08em] text-[#5C6259] font-medium block">
                    {t('Visual Morphological Evidence:')}
                  </span>
                  <ul className="space-y-1.5 text-[13px] text-[#14231C]">
                    {result.visual_evidence.map((evidence, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#14231C] mt-2 shrink-0" />
                        <span>{evidence}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Differential Diagnoses */}
                {result.alternative_diagnoses && result.alternative_diagnoses.length > 0 && (
                  <div className="space-y-2.5 pt-2">
                    <span className="text-[12px] uppercase tracking-[0.08em] text-[#5C6259] font-medium block">
                      {t('Differential Diagnoses (Weighted):')}
                    </span>
                    <div className="space-y-2">
                      {result.alternative_diagnoses.map((alt) => (
                        <div key={alt.disease} className="p-3 rounded-xl border border-[#E3E1D9] bg-white flex items-center justify-between text-[13px]">
                          <span className="font-medium text-[#14231C] capitalize">
                            {t(alt.disease_name || alt.disease.replace(/_/g, ' '))}
                          </span>
                          <span className="text-[#5C6259] tabular-nums">
                            {Math.round(alt.confidence * 100)}% {t('Probability')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Transition CTA */}
                <div className="pt-2">
                  <Link href={`/farm/${selectedFarmId}`}>
                    <button className="w-full rounded-full bg-[#14231C] text-white hover:bg-[#23372E] py-3 text-[14px] font-medium transition-all flex items-center justify-center gap-2 group">
                      <span>{t('Update Farm Risk Score & View Simulation')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              </div>
            </FadeContent>
          ) : (
            <div className="rounded-[22px] border border-[#E3E1D9] bg-white p-12 text-center flex flex-col items-center justify-center min-h-[380px] space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#F5F4F0] border border-[#E3E1D9] flex items-center justify-center text-[#5C6259]">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-[20px] font-normal text-[#14231C]">{t('Ready for Multimodal Diagnosis')}</h3>
              <p className="text-[13px] text-[#5C6259] max-w-sm">
                {t('Select a benchmark sample or upload a photo, then click')} <strong>{t('Run Diagnosis')}</strong>.
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
    <Suspense fallback={<div className="max-w-5xl mx-auto p-12 text-center text-[13px] text-[#5C6259]">{t('Loading diagnostic interface...')}</div>}>
      <DiagnoseContent />
    </Suspense>
  );
}
