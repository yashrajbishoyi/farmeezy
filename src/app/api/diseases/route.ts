import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { mockDb } from '@/lib/supabase/mock-db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cropId = searchParams.get('crop_id') || undefined;

    const supabase = createServerSupabaseClient();
    if (supabase) {
      let query = supabase.from('diseases').select('*');
      if (cropId) {
        query = query.eq('crop_id', cropId);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return NextResponse.json({ success: true, data });
      }
    }

    const diseases = mockDb.getDiseases(cropId);
    return NextResponse.json({ success: true, data: diseases });
  } catch (error: any) {
    const { searchParams } = new URL(request.url);
    const cropId = searchParams.get('crop_id') || undefined;
    const diseases = mockDb.getDiseases(cropId);
    return NextResponse.json({ success: true, data: diseases });
  }
}
