import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { mockDb } from '@/lib/supabase/mock-db';
import { diagnoseCropImage, buildFullPathologyTestResult } from '@/lib/services/gemini';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { farm_id, image_base64, mime_type, image_url, disease_id, telemetry } = body;

    if (!farm_id || (!image_base64 && !image_url)) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: farm_id and image payload.' },
        { status: 400 }
      );
    }

    // --- Fetch farm from Supabase or fallback to mockDb ---
    let farm: any = null;
    const supabase = createServerSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('farms')
          .select('*, crop:crops(*)')
          .eq('id', farm_id)
          .single();
        if (!error && data) farm = data;
      } catch (err) {
        console.warn('Supabase farm query failed, will fallback to mockDb:', err);
      }
    }
    if (!farm) farm = mockDb.getFarmById(farm_id);
    if (!farm) {
      return NextResponse.json({ success: false, error: 'Farm not found.' }, { status: 404 });
    }

    // Call Gemini multimodal vision AI engine
    const analysis = await diagnoseCropImage({
      imageBase64: image_base64 || '',
      mimeType: mime_type || 'image/jpeg',
      cropContext: farm.crop,
      locationContext: { lat: farm.lat, lng: farm.lng },
      diseaseHint: disease_id,
      imageUrl: image_url,
      telemetry,
    });

    const testResult = buildFullPathologyTestResult(
      analysis,
      { imageBase64: image_base64 || '', mimeType: mime_type || 'image/jpeg', cropContext: farm.crop, telemetry },
      farm
    );

    // Check image validation threshold (PRD §8)
    if (
      analysis.image_quality < 0.3 ||
      analysis.primary_disease === 'invalid_non_plant_image' ||
      analysis.crop === 'invalid_image'
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'The uploaded photo does not appear to be a crop leaf or foliage photo. Please upload a clear photo of plant leaves or crop symptoms taken in daylight.',
        },
        { status: 422 }
      );
    }

    const savedImageUrl =
      image_url ||
      'https://images.unsplash.com/photo-1599818816942-881b212f451f?auto=format&fit=crop&w=800&q=80';

    // --- Persist diagnosis to Supabase or fallback ---
    let savedDiagnosis: any = null;
    const isValidUUID = (id: string) => typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    if (supabase && isValidUUID(farm.id)) {
      try {
        const { data: diagData, error: diagErr } = await (supabase as any)
          .from('diagnoses')
          .insert([
            {
              farm_id: farm.id,
              image_url: savedImageUrl,
              disease_id: analysis.primary_disease,
              confidence: analysis.confidence,
              severity: analysis.severity,
              analysis_json: analysis,
            },
          ])
          .select('*')
          .single();

        if (!diagErr && diagData) {
          savedDiagnosis = diagData;

          // Auto-record high-confidence detections as disease_reports for outbreak tracking
          if (analysis.confidence >= 0.6 && analysis.primary_disease) {
            await (supabase as any).from('disease_reports').insert([
              {
                farm_id: farm.id,
                disease_id: analysis.primary_disease,
                lat: farm.lat,
                lng: farm.lng,
                severity: analysis.severity,
                is_verified: analysis.confidence >= 0.8,
              },
            ]);
          }
        }
      } catch (insertErr) {
        console.warn('Supabase diagnosis insert failed, falling back to mockDb:', insertErr);
      }
    }

    if (!savedDiagnosis) {
      savedDiagnosis = mockDb.createDiagnosis({
        farm_id: farm.id,
        image_url: savedImageUrl,
        disease_id: analysis.primary_disease,
        confidence: analysis.confidence,
        severity: analysis.severity,
        analysis_json: analysis,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        diagnosis: savedDiagnosis,
        analysis,
        test_result: testResult,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
