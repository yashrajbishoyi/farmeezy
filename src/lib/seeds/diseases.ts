import { Disease } from '@/types';

export const SEED_DISEASES: Disease[] = [
  {
    id: 'rice_blast',
    name: 'Rice Blast (Magnaporthe oryzae)',
    crop_id: 'rice',
    category: 'fungal',
    symptoms: [
      'Spindle-shaped elliptical lesions with gray-white centers and dark brown margins',
      'Leaf collar rot and nodal rot',
      'Neck rot causing empty/chaffy panicles (whiteheads)',
    ],
    risk_rules: {
      optimal_temp_min: 20,
      optimal_temp_max: 28,
      min_humidity: 85,
      rain_favorable: true,
      leaf_wetness_hours: 10,
    },
    management_guidance: {
      cultural: 'Avoid excessive nitrogen top-dressing; maintain adequate water management; remove collateral weed hosts around field bunds.',
      biological: 'Apply Pseudomonas fluorescens (0.2%) or Trichoderma harzianum as foliar spray during early morning/evening hours.',
      general: 'Immediately inspect lower canopy and collar region. Follow ICAR/OUAT state agronomy protocols if threshold exceeds 2-5% affected tillers.',
      recommended_timing: 'within_24_hours',
    },
  },
  {
    id: 'bacterial_blight',
    name: 'Bacterial Leaf Blight (Xanthomonas oryzae)',
    crop_id: 'rice',
    category: 'bacterial',
    symptoms: [
      'Water-soaked yellowish-green stripes on leaf margins progressing downwards',
      'Wavy or irregular lesion edges turning straw-colored',
      'Bacterial ooze droplets visible in early morning dew',
    ],
    risk_rules: {
      optimal_temp_min: 25,
      optimal_temp_max: 34,
      min_humidity: 75,
      rain_favorable: true,
      wind_spread: true,
    },
    management_guidance: {
      cultural: 'Drain excess standing water temporarily; postpone nitrogen application; disinfect equipment when moving across plots.',
      biological: 'Spray bio-control formulation with Bacillus subtilis or neem seed kernel extract (NSKE 5%).',
      general: 'Regulate canal irrigation water flow to prevent cross-field transmission. Report to local agricultural extension officer.',
      recommended_timing: 'within_48_hours',
    },
  },
  {
    id: 'sheath_blight',
    name: 'Sheath Blight (Rhizoctonia solani)',
    crop_id: 'rice',
    category: 'fungal',
    symptoms: [
      'Oval greenish-gray water-soaked spots on leaf sheaths near water line',
      'Lesions coalesce with dark reddish-brown borders (snake-skin pattern)',
      'Brown sclerotia adhering loosely to infected leaf surface',
    ],
    risk_rules: {
      optimal_temp_min: 28,
      optimal_temp_max: 32,
      min_humidity: 88,
      rain_favorable: true,
    },
    management_guidance: {
      cultural: 'Wider plant spacing to facilitate air circulation; apply split potash fertilization; destroy stubble post-harvest.',
      biological: 'Foliar application of Trichoderma viride enriched bio-compost.',
      general: 'Monitor lower leaf sheaths weekly during tillering to heading stages.',
      recommended_timing: 'within_48_hours',
    },
  },
  {
    id: 'brown_spot',
    name: 'Brown Spot (Bipolaris oryzae)',
    crop_id: 'rice',
    category: 'fungal',
    symptoms: [
      'Small circular to oval dark brown spots with light brown or gray centers',
      'Yellow chlorotic halos surrounding lesions',
      'Discoloration on grain glumes',
    ],
    risk_rules: {
      optimal_temp_min: 25,
      optimal_temp_max: 30,
      min_humidity: 80,
      nutrient_deficiency_aggravated: true,
    },
    management_guidance: {
      cultural: 'Correct soil potassium, zinc, and micronutrient deficiencies; ensure balanced organic manure application.',
      biological: 'Seed priming with biocontrol agents before sowing.',
      general: 'Carry out soil health card testing to address chronic micronutrient stress.',
      recommended_timing: 'within_72_hours',
    },
  },
  {
    id: 'wheat_yellow_rust',
    name: 'Yellow Stripe Rust (Puccinia striiformis)',
    crop_id: 'wheat',
    category: 'fungal',
    symptoms: [
      'Linear bright yellow-orange pustules aligned along leaf veins',
      'Chlorotic stripes turning necrotic',
      'Premature drying of flags and leaves',
    ],
    risk_rules: {
      optimal_temp_min: 10,
      optimal_temp_max: 20,
      min_humidity: 85,
      wind_spread: true,
    },
    management_guidance: {
      cultural: 'Use certified rust-resistant varieties; avoid excessive irrigation in cool misty periods.',
      biological: 'Prophylactic bio-fungicide sprays at initial sign of foci.',
      general: 'Initiate cluster-level surveillance as airborne urediniospores travel rapidly on prevailing winds.',
      recommended_timing: 'within_24_hours',
    },
  },
  {
    id: 'tomato_early_blight',
    name: 'Early Blight (Alternaria solani)',
    crop_id: 'tomato',
    category: 'fungal',
    symptoms: [
      'Target-like concentric ring brown lesions on older bottom leaves',
      'Collar rot / stem cankers near ground level',
      'Dark sunken leathery patches at the stem end of fruits',
    ],
    risk_rules: {
      optimal_temp_min: 24,
      optimal_temp_max: 29,
      min_humidity: 80,
      rain_favorable: true,
    },
    management_guidance: {
      cultural: 'Stake plants; prune bottom 30 cm leaves touching damp soil; utilize drip irrigation rather than overhead sprinklers.',
      biological: 'Foliar treatment with Trichoderma viride or Bacillus bio-formulations.',
      general: 'Disinfect pruning shears between plants and solarize nursery beds before subsequent crops.',
      recommended_timing: 'within_24_hours',
    },
  },
];
