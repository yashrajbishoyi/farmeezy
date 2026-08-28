import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { mockDb } from '@/lib/supabase/mock-db';
import { getFarmWeather } from '@/lib/services/weather';
import { calculateDiseaseRisk } from '@/lib/engines/risk-engine';

export async function GET(
  request: Request,
  { params }: { params: { farmId: string } }
) {
  try {
    const supabase = createServerSupabaseClient();

    // --- Farm ---
    let farm: any = null;
    if (supabase) {
      const { data, error } = await supabase
        .from('farms')
        .select('*, crop:crops(*)')
        .eq('id', params.farmId)
        .single();
      if (!error && data) farm = data;
    }
    if (!farm) farm = mockDb.getFarmById(params.farmId);
    if (!farm) {
      return NextResponse.json({ success: false, error: 'Farm not found' }, { status: 404 });
    }

    // --- Diagnoses ---
    let diagnoses: any[] = [];
    if (supabase) {
      const { data, error } = await supabase
        .from('diagnoses')
        .select('*')
        .eq('farm_id', farm.id)
        .order('created_at', { ascending: false });
      if (!error && data) diagnoses = data;
    }
    if (!diagnoses.length) diagnoses = mockDb.getDiagnosesByFarmId(farm.id);
    const latestDiag = diagnoses[0];

    const diseaseId = latestDiag?.disease_id || (farm.crop_id === 'rice' ? 'rice_blast' : 'tomato_early_blight');

    // --- Disease ---
    let disease: any = null;
    if (supabase) {
      const { data } = await supabase.from('diseases').select('*').eq('id', diseaseId).single();
      if (data) disease = data;
    }
    if (!disease) disease = mockDb.getDiseaseById(diseaseId) || mockDb.getDiseases(farm.crop_id)[0];

    const weather = await getFarmWeather(farm.lat, farm.lng, farm.id);

    let growthStage = undefined;
    if (farm.crop && farm.sowing_date) {
      const daysSinceSowing = Math.max(
        0,
        Math.floor((Date.now() - new Date(farm.sowing_date).getTime()) / (24 * 60 * 60 * 1000))
      );
      const stages = farm.crop?.growth_stages ?? [];
      growthStage = stages.find(
        (st: any) => daysSinceSowing >= st.days_start && daysSinceSowing <= st.days_end
      );
    }

    // --- Nearby reports ---
    let nearbyReports: any[] = [];
    if (supabase) {
      const { data, error } = await supabase
        .from('disease_reports')
        .select('*')
        .eq('disease_id', disease?.id);
      if (!error && data) nearbyReports = data;
    }
    if (!nearbyReports.length) {
      nearbyReports = mockDb.getDiseaseReports({
        disease_id: disease?.id,
        lat: farm.lat,
        lng: farm.lng,
        radius_km: 10,
      });
    }

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

    // --- Persist risk prediction ---
    if (supabase) {
      try {
        await (supabase as any).from('risk_predictions').insert([
          {
            farm_id: farm.id,
            disease_id: disease?.id,
            risk_score: riskPrediction.risk_score,
            risk_level: riskPrediction.risk_level,
            factors_json: riskPrediction.factors_json,
            forecast_json: riskPrediction.forecast_json,
            predicted_at: new Date().toISOString(),
          },
        ]);
      } catch (insertErr) {
        console.warn('Failed to persist risk prediction to Supabase:', insertErr);
      }
    } else {
      mockDb.saveRiskPrediction(riskPrediction);
    }

    return NextResponse.json({ success: true, data: riskPrediction });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
