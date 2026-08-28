-- Farmeezy Seed Data
-- Crops, Diseases, Demo Farms in Odisha, Seeded Reports & Outbreak Cluster

-- 1. Insert Crops
INSERT INTO public.crops (id, name, scientific_name, growth_stages, base_yield_per_acre, default_price_per_unit) VALUES
('rice', 'Rice (Paddy)', 'Oryza sativa', '[
  {"stage": "Seedling", "days_start": 0, "days_end": 20, "susceptibility": 0.3},
  {"stage": "Tillering", "days_start": 21, "days_end": 45, "susceptibility": 0.7},
  {"stage": "Panicle Initiation", "days_start": 46, "days_end": 75, "susceptibility": 0.9},
  {"stage": "Flowering & Heading", "days_start": 76, "days_end": 95, "susceptibility": 0.85},
  {"stage": "Ripening & Maturity", "days_start": 96, "days_end": 120, "susceptibility": 0.2}
]'::jsonb, 22.5, 2183.0),

('wheat', 'Wheat', 'Triticum aestivum', '[
  {"stage": "Crown Root", "days_start": 0, "days_end": 25, "susceptibility": 0.2},
  {"stage": "Tillering", "days_start": 26, "days_end": 50, "susceptibility": 0.6},
  {"stage": "Jointing & Booting", "days_start": 51, "days_end": 75, "susceptibility": 0.85},
  {"stage": "Heading & Flowering", "days_start": 76, "days_end": 95, "susceptibility": 0.9},
  {"stage": "Grain Filling", "days_start": 96, "days_end": 125, "susceptibility": 0.4}
]'::jsonb, 18.0, 2275.0),

('maize', 'Maize (Corn)', 'Zea mays', '[
  {"stage": "Early Vegetative", "days_start": 0, "days_end": 25, "susceptibility": 0.3},
  {"stage": "V6 to V12", "days_start": 26, "days_end": 50, "susceptibility": 0.65},
  {"stage": "Tasseling & Silking", "days_start": 51, "days_end": 75, "susceptibility": 0.85},
  {"stage": "Grain Fill (Blister/Dent)", "days_start": 76, "days_end": 100, "susceptibility": 0.5},
  {"stage": "Maturity", "days_start": 101, "days_end": 115, "susceptibility": 0.2}
]'::jsonb, 25.0, 2090.0),

('tomato', 'Tomato', 'Solanum lycopersicum', '[
  {"stage": "Nursery & Transplant", "days_start": 0, "days_end": 25, "susceptibility": 0.4},
  {"stage": "Vegetative Growth", "days_start": 26, "days_end": 50, "susceptibility": 0.6},
  {"stage": "Flowering & Fruit Set", "days_start": 51, "days_end": 80, "susceptibility": 0.9},
  {"stage": "Fruit Development & Ripening", "days_start": 81, "days_end": 120, "susceptibility": 0.8}
]'::jsonb, 120.0, 1600.0)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  scientific_name = EXCLUDED.scientific_name,
  growth_stages = EXCLUDED.growth_stages;

-- 2. Insert Diseases
INSERT INTO public.diseases (id, name, crop_id, category, symptoms, risk_rules, management_guidance) VALUES
('rice_blast', 'Rice Blast', 'rice', 'fungal', 
 ARRAY['Spindle-shaped elliptical lesions with gray-white centers', 'Brown margins on leaves', 'Neck rot during heading stage'],
 '{"optimal_temp_min": 20, "optimal_temp_max": 28, "min_humidity": 85, "rain_favorable": true, "leaf_wetness_hours": 10}'::jsonb,
 '{"cultural": "Avoid excessive nitrogen fertilization; maintain optimal field drainage.", "biological": "Apply Pseudomonas fluorescens or Trichoderma as prophylactic seed/foliar bio-agent.", "general": "Inspect fields within 24 hours. If symptoms exceed economic threshold, consult local Krishi Vigyan Kendra (KVK) for certified biocontrol interventions.", "recommended_timing": "within_24_hours"}'::jsonb
),

('bacterial_blight', 'Bacterial Leaf Blight', 'rice', 'bacterial',
 ARRAY['Water-soaked yellowish to white stripes on leaf margins', 'Wavy lesion margins progressing downward', 'Bacterial ooze droplets in early morning'],
 '{"optimal_temp_min": 25, "optimal_temp_max": 34, "min_humidity": 75, "rain_favorable": true, "wind_spread": true}'::jsonb,
 '{"cultural": "Drain field temporarily to reduce humidity; avoid clipping seedlings at transplanting.", "biological": "Apply bio-bactericide formulations based on Bacillus subtilis.", "general": "Monitor floodwater flow between plots to prevent field-to-field spread. Consult local agricultural officer.", "recommended_timing": "within_48_hours"}'::jsonb
),

('sheath_blight', 'Sheath Blight', 'rice', 'fungal',
 ARRAY['Oval greenish-gray water-soaked spots on leaf sheaths', 'Irregular lesions with dark brown borders', 'Sclerotia formation on infected tissues'],
 '{"optimal_temp_min": 28, "optimal_temp_max": 32, "min_humidity": 88, "rain_favorable": true}'::jsonb,
 '{"cultural": "Wide spacing to increase canopy aeration; balanced potash application.", "biological": "Bio-priming with Trichoderma harzianum.", "general": "Inspect lower tillers near the water line. Follow state agronomy protocol.", "recommended_timing": "within_48_hours"}'::jsonb
),

('brown_spot', 'Brown Spot', 'rice', 'fungal',
 ARRAY['Small circular to oval dark brown spots on leaves and glumes', 'Yellow halo surrounding dark brown center', 'Seed discoloration'],
 '{"optimal_temp_min": 25, "optimal_temp_max": 30, "min_humidity": 80, "nutrient_deficiency_aggravated": true}'::jsonb,
 '{"cultural": "Ensure balanced nutrition, especially potassium, zinc, and organic manure; improve soil health.", "biological": "Seed treatment with antagonistic bio-agents.", "general": "Soil testing recommended to address chronic nutrient stress.", "recommended_timing": "within_72_hours"}'::jsonb
),

('wheat_yellow_rust', 'Stripe / Yellow Rust', 'wheat', 'fungal',
 ARRAY['Linear bright yellow-orange pustules arranged in stripes along leaf veins', 'Chlorotic streaks', 'Premature leaf drying'],
 '{"optimal_temp_min": 10, "optimal_temp_max": 20, "min_humidity": 85, "wind_dispersal": true}'::jsonb,
 '{"cultural": "Plant resistant cultivars recommended by ICAR; avoid excessive late irrigation.", "biological": "Bio-fungicide spray at first spot appearance.", "general": "Initiate community field scouting as yellow rust spores travel long distances on wind.", "recommended_timing": "within_24_hours"}'::jsonb
),

('tomato_early_blight', 'Early Blight', 'tomato', 'fungal',
 ARRAY['Target-like concentric ring brown lesions on older leaves', 'Stem cankers near soil line', 'Dark leathery sunken spots on fruit stem end'],
 '{"optimal_temp_min": 24, "optimal_temp_max": 29, "min_humidity": 80, "rain_splash": true}'::jsonb,
 '{"cultural": "Stake plants and prune lower leaves touching soil; use drip irrigation rather than overhead sprinklers.", "biological": "Foliar application of Trichoderma viride.", "general": "Sanitize tools between handling affected plants. Refer to local extension guidelines.", "recommended_timing": "within_24_hours"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  symptoms = EXCLUDED.symptoms,
  risk_rules = EXCLUDED.risk_rules,
  management_guidance = EXCLUDED.management_guidance;
