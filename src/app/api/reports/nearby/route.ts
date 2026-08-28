import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { mockDb } from '@/lib/supabase/mock-db';

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined;
    const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined;
    const radius = searchParams.get('radius') ? parseFloat(searchParams.get('radius')!) : 25;
    const disease = searchParams.get('disease') || undefined;

    const supabase = createServerSupabaseClient();
    if (supabase) {
      let query = supabase
        .from('disease_reports')
        .select('*, disease:diseases(*)')
        .order('reported_at', { ascending: false });

      if (disease) {
        query = query.eq('disease_id', disease);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        let filtered = data;
        if (lat !== undefined && lng !== undefined) {
          filtered = data.filter((r: any) => haversineDistance(lat, lng, r.lat, r.lng) <= radius);
        }
        return NextResponse.json({ success: true, count: filtered.length, data: filtered });
      }
    }

    const reports = mockDb.getDiseaseReports({
      disease_id: disease,
      lat,
      lng,
      radius_km: radius,
    });

    return NextResponse.json({ success: true, count: reports.length, data: reports });
  } catch (error: any) {
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
  }
}
