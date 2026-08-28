import { createBrowserClient } from '@supabase/ssr';
import { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));
}

export function createClient() {
  if (!isSupabaseConfigured()) {
    // Graceful null / mock handling
    return null;
  }
  return createBrowserClient<Database>(supabaseUrl!, supabaseAnonKey!);
}
