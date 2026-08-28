import { NextResponse } from 'next/server';
import { mockDb } from '@/lib/supabase/mock-db';
import { diagnoseCropImage } from '@/lib/services/gemini';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { farm_id, image_base64, mime_type, image_url } = body;

    if (!farm_id || (!image_base64 && !image_url)) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: farm_id and image payload.' },
        { status: 400 }
      );
    }

    const farm = mockDb.getFarmById(farm_id);
    if (!farm) {
      return NextResponse.json({ success: false, error: 'Farm not found.' }, { status: 404 });
    }

    // Call Gemini multimodal vision AI engine
    const analysis = await diagnoseCropImage({
      imageBase64: image_base64 || '',
      mimeType: mime_type || 'image/jpeg',
      cropContext: farm.crop,
      locationContext: { lat: farm.lat, lng: farm.lng },
    });

    // Check image validation threshold (PRD §8)
    if (analysis.image_quality < 0.3) {
      return NextResponse.json(
        {
          success: false,
          error: 'Image is too blurry or low quality for reliable plant disease diagnosis. Please upload a clear photo of the leaf symptoms in daylight.',
        },
        { status: 422 }
      );
    }

    // Save diagnosis record
    const savedDiagnosis = mockDb.createDiagnosis({
      farm_id: farm.id,
      image_url: image_url || 'https://images.unsplash.com/photo-1599818816942-881b212f451f?auto=format&fit=crop&w=800&q=80',
      disease_id: analysis.primary_disease,
      confidence: analysis.confidence,
      severity: analysis.severity,
      analysis_json: analysis,
    });

    return NextResponse.json({
      success: true,
      data: {
        diagnosis: savedDiagnosis,
        analysis,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
