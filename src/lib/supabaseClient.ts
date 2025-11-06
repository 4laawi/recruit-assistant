

import { createClient } from '@supabase/supabase-js'

// Validate required environment variables
function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is required. Please check your environment variables.');
  }
  return url;
}

function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required. Please check your environment variables.');
  }
  return key;
}

// Create Supabase client with validation
export const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseAnonKey()
)
