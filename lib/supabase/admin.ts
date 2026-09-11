import { createClient } from "@supabase/supabase-js";

/**
 * Cliente com a "secret key" (service role) do Supabase — ignora RLS
 * completamente. NUNCA importar isto em um Client Component ou em qualquer
 * arquivo que possa acabar no bundle do navegador; só usar dentro de Server
 * Actions/Route Handlers. Hoje o único uso é resolver username -> e-mail no
 * login (lib/actions/auth.ts), antes de existir uma sessão pra RLS aplicar.
 */
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
