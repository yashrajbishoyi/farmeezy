import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { mockDb } from '@/lib/supabase/mock-db';
import { getFarmWeather } from '@/lib/services/weather';

export async function GET(
  request: Request,
  { params }: { params: { farmId: string } }
) {
  try {
    const supabase = createServerSupabaseClient();

    let farm: any = null;
    if (supabase) {
      const { data, error } = await supabase
        .from('farms')
        .select('id, lat, lng')
        .eq('id', params.farmId)
        .single();
      if (!error && data) farm = data;
    }
    if (!farm) farm = mockDb.getFarmById(params.farmId);
    if (!farm) {
      return NextResponse.json({ success: false, error: 'Farm not found' }, { status: 404 });
    }

    const weather = await getFarmWeather(farm.lat, farm.lng, farm.id);
    return NextResponse.json({ success: true, data: weather });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
