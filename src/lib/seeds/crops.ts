import { Crop } from '@/types';

export const SEED_CROPS: Crop[] = [
  {
    id: 'rice',
    name: 'Rice (Paddy)',
    scientific_name: 'Oryza sativa',
    base_yield_per_acre: 22.5, // quintals per acre
    default_price_per_unit: 2183.0, // MSP INR per quintal (Odisha Kharif)
    growth_stages: [
      { stage: 'Seedling', days_start: 0, days_end: 20, susceptibility: 0.3 },
      { stage: 'Tillering', days_start: 21, days_end: 45, susceptibility: 0.7 },
      { stage: 'Panicle Initiation', days_start: 46, days_end: 75, susceptibility: 0.9 },
      { stage: 'Flowering & Heading', days_start: 76, days_end: 95, susceptibility: 0.85 },
      { stage: 'Ripening & Maturity', days_start: 96, days_end: 120, susceptibility: 0.2 },
    ],
  },
  {
    id: 'wheat',
    name: 'Wheat',
    scientific_name: 'Triticum aestivum',
    base_yield_per_acre: 18.0,
    default_price_per_unit: 2275.0,
    growth_stages: [
      { stage: 'Crown Root Initiation', days_start: 0, days_end: 25, susceptibility: 0.2 },
      { stage: 'Tillering', days_start: 26, days_end: 50, susceptibility: 0.6 },
      { stage: 'Jointing & Booting', days_start: 51, days_end: 75, susceptibility: 0.85 },
      { stage: 'Heading & Flowering', days_start: 76, days_end: 95, susceptibility: 0.9 },
      { stage: 'Grain Filling', days_start: 96, days_end: 125, susceptibility: 0.4 },
    ],
  },
  {
    id: 'maize',
    name: 'Maize (Corn)',
    scientific_name: 'Zea mays',
    base_yield_per_acre: 25.0,
    default_price_per_unit: 2090.0,
    growth_stages: [
      { stage: 'Early Vegetative', days_start: 0, days_end: 25, susceptibility: 0.3 },
      { stage: 'V6 to V12 Growth', days_start: 26, days_end: 50, susceptibility: 0.65 },
      { stage: 'Tasseling & Silking', days_start: 51, days_end: 75, susceptibility: 0.85 },
      { stage: 'Grain Fill', days_start: 76, days_end: 100, susceptibility: 0.5 },
      { stage: 'Maturity', days_start: 101, days_end: 115, susceptibility: 0.2 },
    ],
  },
  {
    id: 'tomato',
    name: 'Tomato',
    scientific_name: 'Solanum lycopersicum',
    base_yield_per_acre: 120.0,
    default_price_per_unit: 1600.0,
    growth_stages: [
      { stage: 'Nursery & Transplant', days_start: 0, days_end: 25, susceptibility: 0.4 },
      { stage: 'Vegetative Growth', days_start: 26, days_end: 50, susceptibility: 0.6 },
      { stage: 'Flowering & Fruit Set', days_start: 51, days_end: 80, susceptibility: 0.9 },
      { stage: 'Fruit Ripening', days_start: 81, days_end: 120, susceptibility: 0.8 },
    ],
  },
];
