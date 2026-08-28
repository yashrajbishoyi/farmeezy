import { NextResponse } from 'next/server';
import { TRANSLATION_DICTIONARY } from '@/lib/translation/dictionary';

export async function GET() {
  return NextResponse.json(TRANSLATION_DICTIONARY);
}
