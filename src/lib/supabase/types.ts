export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: 'farmer' | 'officer' | 'admin';
          language: string;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          role?: 'farmer' | 'officer' | 'admin';
          language?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: 'farmer' | 'officer' | 'admin';
          language?: string;
          created_at?: string;
        };
      };
      crops: {
        Row: {
          id: string;
          name: string;
          scientific_name: string;
          growth_stages: Json;
          base_yield_per_acre: number;
          default_price_per_unit: number;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          scientific_name: string;
          growth_stages?: Json;
          base_yield_per_acre?: number;
          default_price_per_unit?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          scientific_name?: string;
          growth_stages?: Json;
          base_yield_per_acre?: number;
          default_price_per_unit?: number;
          created_at?: string;
        };
      };
      diseases: {
        Row: {
          id: string;
          name: string;
          crop_id: string;
          category: 'fungal' | 'bacterial' | 'viral' | 'pest' | 'deficiency';
          symptoms: string[];
          risk_rules: Json;
          management_guidance: Json;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          crop_id: string;
          category: 'fungal' | 'bacterial' | 'viral' | 'pest' | 'deficiency';
          symptoms?: string[];
          risk_rules?: Json;
          management_guidance?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          crop_id?: string;
          category?: 'fungal' | 'bacterial' | 'viral' | 'pest' | 'deficiency';
          symptoms?: string[];
          risk_rules?: Json;
          management_guidance?: Json;
          created_at?: string;
        };
      };
      farms: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          lat: number;
          lng: number;
          area_acres: number;
          crop_id: string;
          variety: string | null;
          sowing_date: string;
          is_demo: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          lat: number;
          lng: number;
          area_acres?: number;
          crop_id: string;
          variety?: string | null;
          sowing_date: string;
          is_demo?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          lat?: number;
          lng?: number;
          area_acres?: number;
          crop_id?: string;
          variety?: string | null;
          sowing_date?: string;
          is_demo?: boolean;
          created_at?: string;
        };
      };
      diagnoses: {
        Row: {
          id: string;
          farm_id: string;
          image_url: string;
          disease_id: string | null;
          confidence: number;
          severity: 'low' | 'moderate' | 'high' | 'critical';
          analysis_json: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          farm_id: string;
          image_url: string;
          disease_id?: string | null;
          confidence: number;
          severity: 'low' | 'moderate' | 'high' | 'critical';
          analysis_json?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          farm_id?: string;
          image_url?: string;
          disease_id?: string | null;
          confidence?: number;
          severity?: 'low' | 'moderate' | 'high' | 'critical';
          analysis_json?: Json;
          created_at?: string;
        };
      };
      disease_reports: {
        Row: {
          id: string;
          farm_id: string | null;
          disease_id: string;
          lat: number;
          lng: number;
          confidence: number;
          severity: 'low' | 'moderate' | 'high' | 'critical';
          image_url: string | null;
          reported_at: string;
          verified: boolean;
          is_simulated: boolean;
        };
        Insert: {
          id?: string;
          farm_id?: string | null;
          disease_id: string;
          lat: number;
          lng: number;
          confidence: number;
          severity: 'low' | 'moderate' | 'high' | 'critical';
          image_url?: string | null;
          reported_at?: string;
          verified?: boolean;
          is_simulated?: boolean;
        };
        Update: {
          id?: string;
          farm_id?: string | null;
          disease_id?: string;
          lat?: number;
          lng?: number;
          confidence?: number;
          severity?: 'low' | 'moderate' | 'high' | 'critical';
          image_url?: string | null;
          reported_at?: string;
          verified?: boolean;
          is_simulated?: boolean;
        };
      };
      risk_predictions: {
        Row: {
          id: string;
          farm_id: string;
          disease_id: string;
          risk_score: number;
          risk_level: 'low' | 'moderate' | 'high' | 'critical';
          forecast_json: Json;
          factors_json: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          farm_id: string;
          disease_id: string;
          risk_score: number;
          risk_level: 'low' | 'moderate' | 'high' | 'critical';
          forecast_json?: Json;
          factors_json?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          farm_id?: string;
          disease_id?: string;
          risk_score?: number;
          risk_level?: 'low' | 'moderate' | 'high' | 'critical';
          forecast_json?: Json;
          factors_json?: Json;
          created_at?: string;
        };
      };
      alerts: {
        Row: {
          id: string;
          farm_id: string;
          type: 'outbreak' | 'weather_risk' | 'action_required' | 'system';
          title: string;
          message: string;
          severity: 'low' | 'moderate' | 'high' | 'critical';
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          farm_id: string;
          type: 'outbreak' | 'weather_risk' | 'action_required' | 'system';
          title: string;
          message: string;
          severity: 'low' | 'moderate' | 'high' | 'critical';
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          farm_id?: string;
          type?: 'outbreak' | 'weather_risk' | 'action_required' | 'system';
          title?: string;
          message?: string;
          severity?: 'low' | 'moderate' | 'high' | 'critical';
          read?: boolean;
          created_at?: string;
        };
      };
    };
  };
}
