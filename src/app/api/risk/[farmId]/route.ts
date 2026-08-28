import { NextResponse } from 'next/server';
import { mockDb } from '@/lib/supabase/mock-db';
import { getFarmWeather } from '@/lib/services/weather';
import { calculateDiseaseRisk } from '@/lib/engines/risk-engine';

export async function GET(
  request: Request,
  { params }: { params: { farmId: string } }
) {
  try {
    const farm = mockDb.getFarmById(params.farmId);
    if (!farm) {
      return NextResponse.json({ success: false, error: 'Farm not found' }, { status: 404 });
    }

    const diagnoses = mockDb.getDiagnosesByFarmId(farm.id);
    const latestDiag = diagnoses[0];
    const diseaseId = latestDiag?.disease_id || (farm.crop_id === 'rice' ? 'rice_blast' : 'tomato_early_blight');
    const disease = mockDb.getDiseaseById(diseaseId) || mockDb.getDiseases(farm.crop_id)[0];

    const weather = await getFarmWeather(farm.lat, farm.lng, farm.id);

    let growthStage = undefined;
    if (farm.crop && farm.sowing_date) {
      const daysSinceSowing = Math.max(
        0,
        Math.floor((Date.now() - new Date(farm.sowing_date).getTime()) / (24 * 60 * 60 * 1000))
      );
      growthStage = farm.crop.growth_stages.find(
        st => daysSinceSowing >= st.days_start && daysSinceSowing <= st.days_end
      );
    }

    const nearbyReports = mockDb.getDiseaseReports({
      disease_id: disease?.id,
      lat: farm.lat,
      lng: farm.lng,
      radius_km: 10,
    });

    const riskPrediction = calculateDiseaseRisk({
      farmId: farm.id,
      disease,
      growthStage,
      visionConfidence: latestDiag?.confidence || 0.85,
      currentWeather: weather.current,
      forecastWeather: weather.daily,
      nearbyReports,
      historicalOutbreakFrequency: 0.75,
    });

    mockDb.saveRiskPrediction(riskPrediction);

    return NextResponse.json({ success: true, data: riskPrediction });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
