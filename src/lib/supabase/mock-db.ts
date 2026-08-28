import { 
  Crop, 
  Disease, 
  Farm, 
  Diagnosis, 
  DiseaseReport, 
  RiskPrediction, 
  Alert,
  Profile 
} from '@/types';
import { SEED_CROPS } from '../seeds/crops';
import { SEED_DISEASES } from '../seeds/diseases';
import { 
  SEED_FARMS, 
  SEED_DISEASE_REPORTS, 
  DEMO_PRIMARY_FARM, 
  DEMO_PRIMARY_DIAGNOSIS, 
  SEED_ALERTS,
  DEMO_FARM_ID,
  DEMO_USER_ID
} from '../seeds/demo-farms';

class MockDatabase {
  private profiles: Map<string, Profile> = new Map();
  private crops: Map<string, Crop> = new Map();
  private diseases: Map<string, Disease> = new Map();
  private farms: Map<string, Farm> = new Map();
  private diagnoses: Map<string, Diagnosis> = new Map();
  private diseaseReports: Map<string, DiseaseReport> = new Map();
  private riskPredictions: Map<string, RiskPrediction> = new Map();
  private alerts: Map<string, Alert> = new Map();

  constructor() {
    this.initSeedData();
  }

  public initSeedData() {
    // 1. User profile
    this.profiles.set(DEMO_USER_ID, {
      id: DEMO_USER_ID,
      name: 'Ramesh Patra',
      email: 'ramesh.farmer@farmeezy.demo',
      role: 'farmer',
      language: 'en',
      created_at: new Date().toISOString(),
    });

    // 2. Crops
    SEED_CROPS.forEach(crop => this.crops.set(crop.id, crop));

    // 3. Diseases
    SEED_DISEASES.forEach(disease => this.diseases.set(disease.id, disease));

    // 4. Farms
    SEED_FARMS.forEach(farm => this.farms.set(farm.id, farm));

    // 5. Diagnoses
    this.diagnoses.set(DEMO_PRIMARY_DIAGNOSIS.id, DEMO_PRIMARY_DIAGNOSIS);

    // 6. Reports
    SEED_DISEASE_REPORTS.forEach(report => this.diseaseReports.set(report.id, report));

    // 7. Alerts
    SEED_ALERTS.forEach(alert => this.alerts.set(alert.id, alert));
  }

  // Crops
  public getCrops(): Crop[] {
    return Array.from(this.crops.values());
  }

  public getCropById(id: string): Crop | undefined {
    return this.crops.get(id);
  }

  // Diseases
  public getDiseases(cropId?: string): Disease[] {
    const list = Array.from(this.diseases.values());
    return cropId ? list.filter(d => d.crop_id === cropId) : list;
  }

  public getDiseaseById(id: string): Disease | undefined {
    return this.diseases.get(id);
  }

  // Farms
  public getFarms(userId?: string): Farm[] {
    const all = Array.from(this.farms.values());
    if (!userId) return all;
    return all.filter(f => f.user_id === userId || f.is_demo);
  }

  public getFarmById(id: string): Farm | undefined {
    const farm = this.farms.get(id);
    if (farm && !farm.crop && farm.crop_id) {
      farm.crop = this.crops.get(farm.crop_id);
    }
    return farm;
  }

  public createFarm(data: Omit<Farm, 'id' | 'created_at'>): Farm {
    const id = `farm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newFarm: Farm = {
      ...data,
      id,
      crop: this.crops.get(data.crop_id),
      created_at: new Date().toISOString(),
    };
    this.farms.set(id, newFarm);
    return newFarm;
  }

  // Diagnoses
  public getDiagnosesByFarmId(farmId: string): Diagnosis[] {
    return Array.from(this.diagnoses.values())
      .filter(d => d.farm_id === farmId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public createDiagnosis(data: Omit<Diagnosis, 'id' | 'created_at'>): Diagnosis {
    const id = `diag-${Date.now()}`;
    const newDiag: Diagnosis = {
      ...data,
      id,
      disease: data.disease_id ? this.diseases.get(data.disease_id) : undefined,
      created_at: new Date().toISOString(),
    };
    this.diagnoses.set(id, newDiag);

    // Also auto-record a disease report if a disease was identified with confidence >= 0.7
    const farm = this.getFarmById(data.farm_id);
    if (farm && data.disease_id && data.confidence >= 0.6) {
      this.createDiseaseReport({
        farm_id: farm.id,
        disease_id: data.disease_id,
        lat: farm.lat,
        lng: farm.lng,
        confidence: data.confidence,
        severity: data.severity,
        image_url: data.image_url,
        reported_at: new Date().toISOString(),
        verified: true,
        is_simulated: false,
      });
    }

    return newDiag;
  }

  // Disease Reports
  public getDiseaseReports(filters?: { disease_id?: string; radius_km?: number; lat?: number; lng?: number }): DiseaseReport[] {
    let reports = Array.from(this.diseaseReports.values()).map(r => ({
      ...r,
      disease: this.diseases.get(r.disease_id),
    }));

    if (filters?.disease_id) {
      reports = reports.filter(r => r.disease_id === filters.disease_id);
    }

    if (filters?.lat !== undefined && filters?.lng !== undefined && filters?.radius_km !== undefined) {
      reports = reports.filter(r => {
        const dist = this.haversineDistance(filters.lat!, filters.lng!, r.lat, r.lng);
        return dist <= filters.radius_km!;
      });
    }

    return reports.sort((a, b) => new Date(b.reported_at).getTime() - new Date(a.reported_at).getTime());
  }

  public createDiseaseReport(data: Omit<DiseaseReport, 'id'>): DiseaseReport {
    const id = `report-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newReport: DiseaseReport = {
      ...data,
      id,
      disease: this.diseases.get(data.disease_id),
    };
    this.diseaseReports.set(id, newReport);
    return newReport;
  }

  // Risk Predictions
  public getLatestRiskPrediction(farmId: string): RiskPrediction | undefined {
    const predictions = Array.from(this.riskPredictions.values())
      .filter(p => p.farm_id === farmId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return predictions[0];
  }

  public saveRiskPrediction(prediction: RiskPrediction): RiskPrediction {
    const id = prediction.id || `risk-${Date.now()}`;
    const saved = { ...prediction, id };
    this.riskPredictions.set(id, saved);
    return saved;
  }

  // Alerts
  public getAlerts(farmId?: string): Alert[] {
    const list = Array.from(this.alerts.values());
    if (!farmId) return list;
    return list.filter(a => a.farm_id === farmId);
  }

  public markAlertRead(id: string) {
    const alert = this.alerts.get(id);
    if (alert) {
      alert.read = true;
      this.alerts.set(id, alert);
    }
  }

  // Helper Haversine
  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

// Global singleton for in-memory mock DB across Next.js API routes & SSR
const globalForMockDb = globalThis as unknown as { mockDatabaseInstance?: MockDatabase };

export const mockDb = globalForMockDb.mockDatabaseInstance ?? new MockDatabase();

if (process.env.NODE_ENV !== 'production') {
  globalForMockDb.mockDatabaseInstance = mockDb;
}
