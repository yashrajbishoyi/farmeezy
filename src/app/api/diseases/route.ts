import { NextResponse } from 'next/server';
import { mockDb } from '@/lib/supabase/mock-db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cropId = searchParams.get('crop_id') || undefined;
    const diseases = mockDb.getDiseases(cropId);
    return NextResponse.json({ success: true, data: diseases });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
