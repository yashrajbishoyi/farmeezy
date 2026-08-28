import { NextResponse } from 'next/server';
import { mockDb } from '@/lib/supabase/mock-db';
import { detectOutbreaks } from '@/lib/engines/outbreak-engine';

export async function GET() {
  try {
    const allReports = mockDb.getDiseaseReports();
    const clusters = detectOutbreaks(allReports);

    return NextResponse.json({
      success: true,
      count: clusters.length,
      data: clusters,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
