import { NextRequest, NextResponse } from 'next/server';
import { translateText, TranslationRequest } from '@/lib/translation/dictionary';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as TranslationRequest;

    if (!body || typeof body.text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request body. "text" is required.' },
        { status: 400 }
      );
    }

    const targetLang = body.target_lang || 'en';
    const sourceLang = body.source_lang || 'en';

    const result = translateText(body.text, targetLang, sourceLang);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Internal server error during translation' },
      { status: 500 }
    );
  }
}
