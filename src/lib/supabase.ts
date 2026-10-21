import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Normaliza a URL caso o usuário inclua /rest/v1/ no final
const rawUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qvelvbzhnirsrribjmiy.supabase.co';
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '');
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_8YPPuMgWoNtKBv8lVICRmg_HxYGI2vr';

export const isSupabaseConfigured =
  Boolean(supabaseUrl) &&
  Boolean(supabaseAnonKey) &&
  !supabaseUrl.includes('seu-projeto') &&
  !supabaseUrl.includes('placeholder');

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 15, // Otimizado para sincronização de Tokens e Rolagens no VTT
    },
  },
});
