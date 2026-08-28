import { describe, it, expect } from 'vitest';
import {
  translateText,
  TRANSLATION_DICTIONARY,
  SUPPORTED_LANGUAGES,
} from '@/lib/translation/dictionary';

describe('Translation Engine & Dictionary', () => {
  it('returns original English text when target_lang is en', () => {
    const res = translateText('Overview', 'en');
    expect(res.translated_text).toBe('Overview');
    expect(res.target_lang).toBe('en');
  });

  it('translates exact dictionary keys to Hindi', () => {
    const res = translateText('Tomato', 'hi');
    expect(res.translated_text).toBe('टमाटर');
    expect(res.target_lang).toBe('hi');
  });

  it('translates exact dictionary keys to Marathi', () => {
    const res = translateText('Potato', 'mr');
    expect(res.translated_text).toBe('बटाटा');
    expect(res.target_lang).toBe('mr');
  });

  it('translates exact dictionary keys to Odia', () => {
    const res = translateText('Rice / Paddy', 'or');
    expect(res.translated_text).toBe('ଧାନ');
    expect(res.target_lang).toBe('or');
  });

  it('translates diseases and advisories accurately', () => {
    const resHi = translateText('Rice_Blast', 'hi');
    expect(resHi.translated_text).toBe('धान का ब्लास्ट रोग (Blast)');

    const resMr = translateText('Healthy', 'mr');
    expect(resMr.translated_text).toBe('निरोगी पीक (कोणताही रोग नाही)');
  });

  it('handles word-by-word fallback for composite text', () => {
    const res = translateText('Tomato Potato', 'hi');
    expect(res.translated_text).toBe('टमाटर आलू');
  });

  it('handles empty or whitespace text gracefully', () => {
    const res = translateText('   ', 'hi');
    expect(res.translated_text).toBe('   ');
  });

  it('includes all supported languages: en, hi, mr, or', () => {
    const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
    expect(codes).toContain('en');
    expect(codes).toContain('hi');
    expect(codes).toContain('mr');
    expect(codes).toContain('or');
  });

  it('has valid dictionary entries for UI, crops, diseases, and alerts', () => {
    expect(TRANSLATION_DICTIONARY['Tomato']).toBeDefined();
    expect(TRANSLATION_DICTIONARY['Potato_Late_Blight']).toBeDefined();
    expect(TRANSLATION_DICTIONARY['Risk Assessment']).toBeDefined();
    expect(TRANSLATION_DICTIONARY['Get Expert Advisory']).toBeDefined();
  });
});
