import { createClient } from "@/lib/supabase/server";

export type Role = "admin" | "cliente";

export interface Sessao {
  userId: string;
  email: string | null;
  role: Role;
  /** Só existe para role "cliente" — nunca vem de input do usuário, só do banco. */
  empresaId: string | null;
}

/**
 * Resolve a sessão do usuário logado a partir do cookie de auth do Supabase
 * — nunca de localStorage, nunca de um parâmetro vindo do cliente. Papel e
 * empresaId vêm de consultas que já passam pelas políticas de RLS do banco
 * (ver migração `core_schema_multi_tenant`), então mesmo um bug aqui não
 * consegue devolver dado de outro usuário.
 */
export async function getSessao(): Promise<Sessao | null> {
  const supabase = await createClient();

  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  if (!claims?.sub) return null;

  const userId = claims.sub;
  const email = typeof claims.email === "string" ? claims.email : null;

  const { data: adminRow } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (adminRow) {
    return { userId, email, role: "admin", empresaId: null };
  }

  const { data: vinculo } = await supabase
    .from("usuarios_empresas")
    .select("empresa_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (vinculo) {
    return { userId, email, role: "cliente", empresaId: vinculo.empresa_id };
  }

  // Autenticado no Supabase, mas sem papel nenhum atribuído ainda
  // (ex.: usuário acabou de se cadastrar e ninguém o vinculou a uma empresa).
  return null;
}
