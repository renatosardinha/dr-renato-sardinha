import 'server-only';
import { createClient } from '@supabase/supabase-js';

// Chave SECRETA: só no servidor. Nunca importar em componente de navegador.
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY não configurada');
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
