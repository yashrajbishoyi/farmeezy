import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { mockDb } from '@/lib/supabase/mock-db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id') || undefined;

    const supabase = createServerSupabaseClient();
    if (supabase) {
      let query = supabase
        .from('farms')
        .select('*, crop:crops(*)')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.or(`user_id.eq.${userId},is_demo.eq.true`);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return NextResponse.json({ success: true, data });
      }
    }

    const farms = mockDb.getFarms(userId);
    return NextResponse.json({ success: true, data: farms });
  } catch (error: any) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id') || undefined;
    const farms = mockDb.getFarms(userId);
    return NextResponse.json({ success: true, data: farms });
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

    const supabase = createServerSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await (supabase as any)
          .from('farms')
          .insert([
            {
              name,
              lat: Number(lat),
              lng: Number(lng),
              area_acres: Number(area_acres) || 1.0,
              crop_id,
              variety: variety || null,
              sowing_date,
              is_demo: false,
            },
          ])
          .select('*, crop:crops(*)')
          .single();

        if (!error && data) {
          return NextResponse.json({ success: true, data }, { status: 201 });
        }
      } catch (insertErr) {
        console.warn('Supabase insert failed, falling back to mockDb:', insertErr);
      }
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
