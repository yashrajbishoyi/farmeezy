import { NextResponse } from 'next/server';
import { mockDb } from '@/lib/supabase/mock-db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id') || undefined;
    const farms = mockDb.getFarms(userId);
    return NextResponse.json({ success: true, data: farms });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, lat, lng, area_acres, crop_id, variety, sowing_date, user_id } = body;

    if (!name || lat === undefined || lng === undefined || !crop_id || !sowing_date) {
      return NextResponse.json(
        { success: false, error: 'Missing required farm parameters (name, lat, lng, crop_id, sowing_date).' },
        { status: 400 }
      );
    }

    const createdFarm = mockDb.createFarm({
      name,
      lat: Number(lat),
      lng: Number(lng),
      area_acres: Number(area_acres) || 1.0,
      crop_id,
      variety: variety || null,
      sowing_date,
      user_id: user_id || 'demo-user-ramesh-patra',
      is_demo: false,
    });

    return NextResponse.json({ success: true, data: createdFarm }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
