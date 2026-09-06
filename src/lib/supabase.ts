import { createClient } from '@supabase/supabase-js';

// Keep the frontend renderable when backend environment variables are not
// configured yet. The MongoDB/Express migration will replace this client.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'implicit',
    storageKey: 'lsd-auth',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});
