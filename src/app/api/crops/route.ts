import { NextResponse } from 'next/server';
import { mockDb } from '@/lib/supabase/mock-db';

export async function GET() {
  try {
    const crops = mockDb.getCrops();
    return NextResponse.json({ success: true, data: crops });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
