import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { mockDb } from '@/lib/supabase/mock-db';
import { detectOutbreaks } from '@/lib/engines/outbreak-engine';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('disease_reports')
        .select('*, disease:diseases(*)')
        .order('reported_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const clusters = detectOutbreaks(data as any);
        return NextResponse.json({
          success: true,
          count: clusters.length,
          data: clusters,
        });
      }
    }

    const allReports = mockDb.getDiseaseReports();
    const clusters = detectOutbreaks(allReports);

    return NextResponse.json({
      success: true,
      count: clusters.length,
      data: clusters,
    });
  } catch (error: any) {
    const allReports = mockDb.getDiseaseReports();
    const clusters = detectOutbreaks(allReports);
    return NextResponse.json({
      success: true,
      count: clusters.length,
      data: clusters,
    });
  }
}
