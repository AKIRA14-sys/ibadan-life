import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseUrl.startsWith('https://') &&
  supabaseKey &&
  supabaseKey.length > 10
);

if (!isSupabaseConfigured) {
  console.warn(
    'IBADAN LIFE: Supabase environment variables (VITE_SUPABASE_URL & VITE_SUPABASE_PUBLISHABLE_KEY) are not configured. Game running in local standalone mode.'
  );
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      realtime: {
        params: {
          eventsPerSecond: 20
        }
      }
    })
  : createClient('https://placeholder-ibadan-life.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder', {
      auth: { persistSession: false }
    });
