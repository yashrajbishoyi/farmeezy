export type UserRole = 'farmer' | 'officer' | 'admin';

export type SeverityLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  language: string;
  created_at: string;
}

export interface GrowthStage {
  stage: string;
  days_start: number;
  days_end: number;
  susceptibility: number; // 0.0 to 1.0
}

export interface Crop {
  id: string; // 'rice', 'wheat', 'maize', 'tomato'
  name: string;
  scientific_name: string;
  growth_stages: GrowthStage[];
  base_yield_per_acre: number; // in quintals
  default_price_per_unit: number; // INR per quintal
  created_at?: string;
}

export interface DiseaseRiskRules {
  optimal_temp_min: number;
  optimal_temp_max: number;
  min_humidity: number;
  rain_favorable?: boolean;
  leaf_wetness_hours?: number;
  wind_spread?: boolean;
  nutrient_deficiency_aggravated?: boolean;
}

export interface DiseaseManagementGuidance {
  cultural: string;
  biological: string;
  general: string;
  recommended_timing: 'within_24_hours' | 'within_48_hours' | 'within_72_hours' | 'routine_monitoring';
}

export interface Disease {
  id: string;
  name: string;
  crop_id: string;
  category: 'fungal' | 'bacterial' | 'viral' | 'pest' | 'deficiency';
  symptoms: string[];
  risk_rules: DiseaseRiskRules;
  management_guidance: DiseaseManagementGuidance;
  created_at?: string;
}

export interface Farm {
  id: string;
  user_id: string;
  name: string;
  lat: number;
  lng: number;
  area_acres: number;
  crop_id: string;
  crop?: Crop;
  variety?: string;
  sowing_date: string; // ISO date 'YYYY-MM-DD'
  is_demo?: boolean;
  created_at?: string;
}

export interface AlternativeDiagnosis {
  disease: string;
  disease_name?: string;
  confidence: number;
}

export interface DiagnosisOutputContract {
  crop: string;
  primary_disease: string;
  confidence: number; // 0.0 to 1.0
  severity: SeverityLevel;
  alternative_diagnoses: AlternativeDiagnosis[];
  visual_evidence: string[];
  image_quality: number; // 0.0 to 1.0
}

export interface Diagnosis {
  id: string;
  farm_id: string;
  image_url: string;
  disease_id: string;
  disease?: Disease;
  confidence: number;
  severity: SeverityLevel;
  analysis_json: DiagnosisOutputContract;
  created_at: string;
}

export interface WeatherObservation {
  id?: string;
  farm_id: string;
  temperature: number; // Celsius
  humidity: number; // Percentage 0-100
  rainfall: number; // mm in last 24h
  wind_speed: number; // km/h
  precip_probability: number; // Percentage 0-100
  observed_at: string;
}

export interface WeatherForecastDay {
  date: string;
  temp_max: number;
  temp_min: number;
  humidity_mean: number;
  rainfall_sum: number;
  precip_probability_max: number;
  wind_speed_max: number;
  condition_code: number;
  condition_text: string;
}

export interface WeatherForecast {
  current: WeatherObservation;
  daily: WeatherForecastDay[];
}

export interface DiseaseReport {
  id: string;
  farm_id?: string;
  disease_id: string;
  disease?: Disease;
  lat: number;
  lng: number;
  confidence: number;
  severity: SeverityLevel;
  image_url?: string;
  reported_at: string;
  verified: boolean;
  is_simulated?: boolean;
}

export interface FactorBreakdown {
  name: string;
  score: number; // 0-100 sub-score
  weight: number; // e.g. 0.35
  impact: number; // weighted points (e.g. 23)
  description: string;
}

export interface RiskForecastPoint {
  date: string;
  day_offset: number;
  risk_score: number;
  risk_level: SeverityLevel;
  weather_factor: number;
  rainfall_expected: number;
}

export interface RiskPrediction {
  id?: string;
  farm_id: string;
  disease_id: string;
  disease_name?: string;
  risk_score: number; // 0-100
  risk_level: SeverityLevel;
  forecast_json: RiskForecastPoint[];
  factors_json: FactorBreakdown[];
  created_at: string;
}

export interface OutbreakCluster {
  cluster_id: string;
  center: { lat: number; lng: number };
  radius_km: number;
  report_count: number;
  risk_level: SeverityLevel;
  disease_id: string;
  disease_name: string;
  growth_rate: 'accelerating' | 'stable' | 'diminishing';
  reports: DiseaseReport[];
}

export type ScenarioType = 'no_action' | 'intervene_today' | 'intervene_after_3_days';

export interface SimulationScenarioResult {
  scenario: ScenarioType;
  scenario_name: string;
  days: number[];
  affected_area_curve: number[]; // % affected on day 0, 3, 7, 14
  peak_risk: number;
  affected_area_percent: number; // final projected %
  estimated_loss: number; // in INR
  timeline: { day: number; risk_score: number; affected_acres: number }[];
}

export interface Simulation {
  id?: string;
  farm_id: string;
  scenarios: Record<ScenarioType, SimulationScenarioResult>;
  parameters_json: {
    propagation_factor: number;
    neighbor_pressure: number;
    intervention_efficacy: number;
  };
  created_at: string;
}

export interface EconomicAnalysis {
  gross_crop_value: number; // area * yield * price
  potential_loss_without_action: number;
  potential_loss_with_action: number;
  potential_loss_delayed_action: number;
  avoided_loss: number;
  intervention_cost: number;
  net_benefit: number;
  roi_percentage: number;
  disclaimer: string;
}

export interface ActionRecommendation {
  priority: 'high' | 'medium' | 'low';
  timing: 'within_24_hours' | 'within_48_hours' | 'within_72_hours' | 'routine_monitoring';
  action: string;
  reason: string;
  cultural_measures: string[];
  biological_measures: string[];
  safety_notice: string;
}

export interface Alert {
  id: string;
  farm_id: string;
  type: 'outbreak' | 'weather_risk' | 'action_required' | 'system';
  title: string;
  message: string;
  severity: SeverityLevel;
  read: boolean;
  created_at: string;
}
