import { NextResponse } from 'next/server';
import { mockDb } from '@/lib/supabase/mock-db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined;
    const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined;
    const radius = searchParams.get('radius') ? parseFloat(searchParams.get('radius')!) : 25;
    const disease = searchParams.get('disease') || undefined;

    const reports = mockDb.getDiseaseReports({
      disease_id: disease,
      lat,
      lng,
      radius_km: radius,
    });

    return NextResponse.json({ success: true, count: reports.length, data: reports });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
