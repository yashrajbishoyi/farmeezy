import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { mockDb } from '@/lib/supabase/mock-db';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('crops')
        .select('*')
        .order('name', { ascending: true });

      if (!error && data && data.length > 0) {
        return NextResponse.json({ success: true, data });
      }
    }

    const crops = mockDb.getCrops();
    return NextResponse.json({ success: true, data: crops });
  } catch (error: any) {
    // Fallback to mockDb on any unexpected error
    const crops = mockDb.getCrops();
    return NextResponse.json({ success: true, data: crops });
  }
}
