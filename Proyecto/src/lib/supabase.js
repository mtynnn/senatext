import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. Revise .env.local.');
}

// Solo la clave anonima, disenada para clientes publicos, puede estar en Vite.
// Las operaciones privilegiadas viven en la Edge Function manage-users.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);