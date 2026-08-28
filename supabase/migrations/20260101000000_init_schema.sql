-- Farmeezy Initial Schema Migration
-- Designed for Smart India Hackathon 2026 MVP

-- Enable UUID extension if not present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles (linked with Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'farmer' CHECK (role IN ('farmer', 'officer', 'admin')),
  language TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Crops
CREATE TABLE IF NOT EXISTS public.crops (
  id TEXT PRIMARY KEY, -- 'rice', 'wheat', 'maize', 'cotton', 'tomato'
  name TEXT NOT NULL,
  scientific_name TEXT NOT NULL,
  growth_stages JSONB NOT NULL DEFAULT '[]'::jsonb,
  base_yield_per_acre NUMERIC NOT NULL DEFAULT 20.0, -- in quintals
  default_price_per_unit NUMERIC NOT NULL DEFAULT 2200.0, -- INR per quintal
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Diseases
CREATE TABLE IF NOT EXISTS public.diseases (
  id TEXT PRIMARY KEY, -- 'rice_blast', 'bacterial_blight', 'sheath_blight', 'brown_spot', etc.
  name TEXT NOT NULL,
  crop_id TEXT NOT NULL REFERENCES public.crops(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('fungal', 'bacterial', 'viral', 'pest', 'deficiency')),
  symptoms TEXT[] NOT NULL DEFAULT '{}',
  risk_rules JSONB NOT NULL DEFAULT '{}'::jsonb,
  management_guidance JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Farms
CREATE TABLE IF NOT EXISTS public.farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  area_acres NUMERIC NOT NULL DEFAULT 1.0,
  crop_id TEXT NOT NULL REFERENCES public.crops(id),
  variety TEXT,
  sowing_date DATE NOT NULL,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Diagnoses
CREATE TABLE IF NOT EXISTS public.diagnoses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  disease_id TEXT REFERENCES public.diseases(id),
  confidence NUMERIC NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'moderate', 'high', 'critical')),
  analysis_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Weather Observations
CREATE TABLE IF NOT EXISTS public.weather_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  temperature NUMERIC NOT NULL,
  humidity NUMERIC NOT NULL,
  rainfall NUMERIC NOT NULL,
  wind_speed NUMERIC NOT NULL,
  precip_probability NUMERIC NOT NULL,
  observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Disease Reports (Regional Map & Outbreak Clusters)
CREATE TABLE IF NOT EXISTS public.disease_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
  disease_id TEXT NOT NULL REFERENCES public.diseases(id),
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  confidence NUMERIC NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'moderate', 'high', 'critical')),
  image_url TEXT,
  reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified BOOLEAN NOT NULL DEFAULT TRUE,
  is_simulated BOOLEAN NOT NULL DEFAULT FALSE
);

-- 8. Risk Predictions
CREATE TABLE IF NOT EXISTS public.risk_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  disease_id TEXT NOT NULL REFERENCES public.diseases(id),
  risk_score NUMERIC NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'moderate', 'high', 'critical')),
  forecast_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  factors_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Simulations
CREATE TABLE IF NOT EXISTS public.simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  scenario TEXT NOT NULL, -- 'no_action' | 'intervene_today' | 'intervene_after_3_days'
  parameters_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  results_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Alerts
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('outbreak', 'weather_risk', 'action_required', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'moderate', 'high', 'critical')),
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_disease_reports_coords ON public.disease_reports (lat, lng);
CREATE INDEX IF NOT EXISTS idx_disease_reports_time ON public.disease_reports (reported_at);
CREATE INDEX IF NOT EXISTS idx_farms_user_id ON public.farms (user_id);
CREATE INDEX IF NOT EXISTS idx_risk_predictions_farm ON public.risk_predictions (farm_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_farm ON public.alerts (farm_id, read, created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disease_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Permissive public read for crops & diseases reference tables
CREATE POLICY "Allow public read on crops" ON public.crops FOR SELECT USING (true);
CREATE POLICY "Allow public read on diseases" ON public.diseases FOR SELECT USING (true);

-- User-scoped farm & diagnosis policies
CREATE POLICY "Users can manage own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage own farms" ON public.farms FOR ALL USING (auth.uid() = user_id OR is_demo = true);
CREATE POLICY "Users can manage own diagnoses" ON public.diagnoses FOR ALL USING (
  EXISTS (SELECT 1 FROM public.farms WHERE farms.id = diagnoses.farm_id AND (farms.user_id = auth.uid() OR farms.is_demo = true))
);
CREATE POLICY "Allow public read for disease reports on map" ON public.disease_reports FOR SELECT USING (true);
CREATE POLICY "Users can insert disease reports" ON public.disease_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can manage own risk predictions" ON public.risk_predictions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.farms WHERE farms.id = risk_predictions.farm_id AND (farms.user_id = auth.uid() OR farms.is_demo = true))
);
CREATE POLICY "Users can manage own simulations" ON public.simulations FOR ALL USING (
  EXISTS (SELECT 1 FROM public.farms WHERE farms.id = simulations.farm_id AND (farms.user_id = auth.uid() OR farms.is_demo = true))
);
CREATE POLICY "Users can manage own alerts" ON public.alerts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.farms WHERE farms.id = alerts.farm_id AND (farms.user_id = auth.uid() OR farms.is_demo = true))
);
