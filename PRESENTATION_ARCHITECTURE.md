# Farmeezy: System Architecture & Data Flow

This document provides complete, accurate architectural diagrams and component breakdowns based on the actual codebase in the Farmeezy repository.

---

## 1. High-Level End-to-End System Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                         CLIENT LAYER                                            │
│                                (Next.js 14 App Router + React 18)                               │
│                                                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────────────┐  │
│  │   Farmer Portal  │  │  Leaf Diagnosis  │  │   AI Assistant   │  │ Officer Regional Map &  │  │
│  │ (/farm/[id],     │  │   (/diagnose)    │  │   (/assistant)   │  │ Contagion Simulator     │  │
│  │  /onboarding)    │  │                  │  │                  │  │ (/map, /simulate,       │  │
│  │                  │  │                  │  │                  │  │  /officer)              │  │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘  └────────────┬────────────┘  │
│           │                     │                     │                         │               │
│           ▼                     ▼                     ▼                         ▼               │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                          LanguageContext & Client Translation (t())                       │  │
│  │                             [ English | Hindi | Marathi | Odia ]                          │  │
│  └────────────────────────────────────────┬──────────────────────────────────────────────────┘  │
└───────────────────────────────────────────┼─────────────────────────────────────────────────────┘
                                            │ HTTP JSON Requests
                                            ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   NEXT.JS API ROUTE LAYER                                       │
│                                   (Server-side Node.js Runtime)                                 │
│                                                                                                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────────────────────┐   │
│  │  /api/farms  │ │/api/diagnose │ │  /api/chat   │ │  /api/risk   │ │     /api/outbreaks    │   │
│  │  /api/crops  │ │              │ │              │ │/api/simulate │ │  /api/reports/nearby  │   │
│  │/api/diseases │ │              │ │              │ │/api/economic │ │  /api/weather/[farmId]│   │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └───────────┬───────────┘   │
└─────────┼────────────────┼────────────────┼────────────────┼─────────────────────┼──────────────┘
          │                │                │                │                     │
          │                │ Image Data     │ Prompt+Context │ Telemetry           │ Coordinates
          │                ▼                ▼                ▼                     ▼
┌─────────┼──────────┬─────────────────────────────┐ ┌───────────────────┐ ┌──────────────────────┐
│         │          │   FOUNDATION AI SERVICES    │ │ DETERMINISTIC     │ │ EXTERNAL TELEMETRY   │
│         │          │ (Google Generative AI SDK)  │ │ ENGINES (Pure TS) │ │                      │
│         │          │                             │ │                   │ │                      │
│         │          │ • Leaf Vision Model         │ │ • Risk Engine     │ │ • Open-Meteo API     │
│         │          │   (gemini-1.5-flash)        │ │ • Outbreak (DBSCAN│ │   Current weather    │
│         │          │                             │ │ • Spread Simulator│ │   7-day forecast   │
│         │          │ • Multilingual Agronomist   │ │ • Economic Model  │ │   (No key required)  │
│         │          │   (gemini-1.5-flash)        │ │ • Recommendations │ │                      │
│         │          └──────────────┬──────────────┘ └─────────┬─────────┘ └──────────┬───────────┘
│         │                         │                          │                      │
│         │ Persist / Read          │ Diagnosis Record         │ Computed Predictions │ Weather Data
│         ▼                         ▼                          ▼                      ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       DATA ACCESS LAYER                                         │
│                                                                                                 │
│                  ┌────────────────────────────────────────────────────────┐                     │
│                  │           createServerSupabaseClient()                 │                     │
│                  │            (isSupabaseConfigured() check)              │                     │
│                  └───────────┬────────────────────────────────┬───────────┘                     │
│                              │                                │                                 │
│                   Configured │                     Fallback / │ Unconfigured /                  │
│                     & Online │                        Offline │ Exception                       │
│                              ▼                                ▼                                 │
│             ┌─────────────────────────────────┐ ┌───────────────────────────┐                   │
│             │       SUPABASE POSTGRESQL       │ │    IN-MEMORY mockDb       │                   │
│             │    (@supabase/supabase-js)      │ │   (src/lib/supabase/      │                   │
│             │                                 │ │     mock-db.ts)           │                   │
│             │ • profiles      • weather_obs   │ │                           │                   │
│             │ • crops         • disease_reps  │ │ • Seeded Odisha demo farms│                   │
│             │ • diseases      • risk_preds    │ │ • In-memory collections   │                   │
│             │ • farms         • simulations   │ │ • Zero-crash resilience   │                   │
│             │ • diagnoses     • alerts        │ │                           │                   │
│             └─────────────────────────────────┘ └───────────────────────────┘                   │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Detailed Data Flow: Multimodal Leaf Diagnosis (`/api/diagnose`)

```text
[Farmer's Camera / File Upload]
       │
       │ (Base64 leaf image + crop_id + farm_id)
       ▼
[POST /api/diagnose]
       │
       ├─► 1. Fetch Farm context from Supabase (or mockDb fallback)
       │
       ├─► 2. Call diagnoseCropImage() in src/lib/services/gemini.ts
       │       │
       │       ├─► Check GEMINI_API_KEY
       │       │     │
       │       │     ├─► [Key Configured]: Send image + Structured JSON Schema to gemini-1.5-flash
       │       │     │                     - Output: { primary_disease, confidence, severity,
       │       │     │                                alternative_diagnoses, visual_evidence, image_quality }
       │       │     │
       │       │     └─► [No Key / API Error]: Calibrated Odisha Demo Vision Fallback (Rice Blast / Early Blight)
       │       │
       │       └─► Return structured DiagnosisOutputContract
       │
       ├─► 3. Validate image_quality >= 0.3 (Reject blurry images with HTTP 422)
       │
       ├─► 4. Persist diagnosis record to Supabase public.diagnoses table
       │
       ├─► 5. Outbreak Feed Trigger:
       │       If confidence >= 0.6:
       │       Auto-insert disease report to public.disease_reports (is_verified = confidence >= 0.8)
       │
       ▼
[JSON Response: { success: true, data: { diagnosis, analysis } }] ──► [UI Renders Diagnostic Dashboard]
```

---

## 3. Detailed Data Flow: AI Chatbot Assistant (`/api/chat`)

```text
[Farmer types question in Hindi/Marathi/Odia/English]
       │
       │ POST { farm_id, message, conversation_history, language }
       ▼
[POST /api/chat]
       │
       ├─► 1. Fetch Farm, joined Crop, latest Diagnosis, and nearby Outbreaks from Supabase
       ├─► 2. Fetch live Open-Meteo Weather (Temp, Humidity, Rain)
       ├─► 3. Execute calculateDiseaseRisk() -> computes dynamic Risk Score (0-100) & Level
       │
       ├─► 4. Assemble Grounded Prompt Context:
       │       - Farm telemetry (crop variety, sowing date, area)
       │       - Live weather (e.g. 88% humidity, 26°C)
       │       - Risk score (e.g. 81/100, Critical)
       │       - Strict Safety Rules: No chemical dosages, no markdown asterisks (*),
       │         focus on biocontrol & cultural practices, recommend local KVK
       │       - CRITICAL LANGUAGE DIRECTIVE: Output 100% in requested language (hi/mr/or/en)
       │
       ├─► 5. Send Prompt to gemini-1.5-flash
       │       │
       │       ├─► [Success]: Strip asterisks -> return clean formatted response
       │       └─► [Gemini Error / Offline]: Context-aware localized fallback response generator
       │
       ▼
[JSON Response: { success: true, reply }] ──► [UI Displays Localized Chat Bubble]
```

---

## 4. Detailed Data Flow: Composite Farm Health Intelligence (`/api/farms/[id]`)

```text
[Browser navigates to /farm/[id]]
       │
       ▼
[GET /api/farms/[id]]
       │
       ├─► 1. Query Supabase for Farm + joined Crop
       ├─► 2. Query Supabase for Diagnoses history (get latest diagnosis)
       ├─► 3. Query Supabase for Available Diseases for this crop
       ├─► 4. Query Supabase for Nearby Disease Reports within 10 km
       ├─► 5. Query Supabase for Active Farm Alerts
       ├─► 6. Fetch live Open-Meteo Weather (current + 7-day forecast)
       │
       ├─► 7. [RISK ENGINE - Pure TS]
       │       calculateDiseaseRisk(vision, weather, growth_stage, regional_pressure, historical)
       │       ──► Output: Risk Score (0-100), Risk Level, 5 Factor Breakdowns, 7-day Curve
       │
       ├─► 8. [SIMULATION ENGINE - Pure TS]
       │       runSpreadSimulation(primaryFarm, neighborFarms, initialRisk, disease)
       │       ──► Output: 14-day curves for No Action vs Intervene Today vs Intervene Day 3
       │
       ├─► 9. [ECONOMIC ENGINE - Pure TS]
       │       calculateEconomicImpact(farm, simulation scenarios, ICAR damage functions, MSP)
       │       ──► Output: Gross Crop Value, Potential Loss, Avoided Loss, Intervention Cost, Net ROI
       │
       ├─► 10. [RECOMMENDATION ENGINE - Pure TS]
       │       generateActionRecommendation(disease, risk, weather, economicAnalysis)
       │       ──► Output: Action Priority, Timing, Cultural Measures, Biological Measures, Safety Notice
       │
       ▼
[JSON Composite Payload] ──► [Dashboard Renders Risk Gauges, Weather Widget, ROI Card, Simulation Graph]
```

---

## 5. Summary of Boundary: AI vs. Deterministic Algorithms

| System | Component | Technology | Deterministic? | Explainability |
|---|---|---|---|---|
| **Leaf Vision** | Foliage Diagnosis | `gemini-1.5-flash` | No (Probabilistic Multimodal) | Returns confidence & visual evidence strings |
| **Chatbot** | Agronomic Advisor | `gemini-1.5-flash` | No (Probabilistic LLM) | Guided by system prompt constraints |
| **Risk Assessment** | Multi-Factor Risk Score | `risk-engine.ts` | **YES (100% Deterministic Math)** | Exact weighted sum (35/20/15/15/10) |
| **Regional Outbreaks**| Outbreak Clustering | `outbreak-engine.ts` | **YES (100% Deterministic Math)** | Exact DBSCAN spatial clustering over Haversine |
| **Disease Contagion** | Spread Simulation | `simulation-engine.ts` | **YES (100% Deterministic Math)** | Exact differential spread & decay equations |
| **Financial Impact** | Loss & ROI Valuation | `economic-engine.ts` | **YES (100% Deterministic Math)** | Exact formulas using ICAR yield MSP models |
| **Action Planning** | Treatment Recommendations| `recommendation-engine.ts`| **YES (100% Deterministic Rules)** | Exact threshold-based decision tree |
| **Translation** | Static UI Strings | `dictionary.ts` | **YES (100% Deterministic Map)** | Exact key-value lookup for 4 languages |
