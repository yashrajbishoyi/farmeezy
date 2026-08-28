import { NextResponse } from 'next/server';
import { mockDb } from '@/lib/supabase/mock-db';
import { getFarmWeather } from '@/lib/services/weather';

export async function GET(
  request: Request,
  { params }: { params: { farmId: string } }
) {
  try {
    const farm = mockDb.getFarmById(params.farmId);
    if (!farm) {
      return NextResponse.json({ success: false, error: 'Farm not found' }, { status: 404 });
    }

    const weather = await getFarmWeather(farm.lat, farm.lng, farm.id);
    return NextResponse.json({ success: true, data: weather });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
