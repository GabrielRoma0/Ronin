import { createClient } from "@/lib/supabase/server";

export type Role = "dono" | "funcionario";

export interface Sessao {
  userId: string;
  /** E-mail interno (ex.: "dono1@ronin.staff") — nunca mostrado na UI, é só um identificador técnico do login por username. */
  email: string | null;
  username: string | null;
  role: Role;
  empresaId: string;
}

/**
 * Resolve a sessão do usuário logado a partir do cookie de auth do Supabase
 * — nunca de localStorage, nunca de um parâmetro vindo do cliente. Papel e
 * empresaId vêm de `usuarios_empresas`, sempre filtrados pela política de
 * RLS do banco, então mesmo um bug aqui não consegue devolver dado de outro
 * usuário. Um usuário pode ter linhas em mais de uma empresa (ex.: fixtures
 * de teste de isolamento) — `order by created_at` garante que o vínculo mais
 * antigo é sempre o resolvido, de forma determinística.
 */
export async function getSessao(): Promise<Sessao | null> {
  const supabase = await createClient();

  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  if (!claims?.sub) return null;

  const userId = claims.sub;
  const email = typeof claims.email === "string" ? claims.email : null;

  const { data: vinculo } = await supabase
    .from("usuarios_empresas")
    .select("empresa_id, papel, username")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!vinculo) {
    // Autenticado no Supabase, mas sem papel nenhum atribuído ainda.
    return null;
  }

  return {
    userId,
    email,
    username: vinculo.username,
    role: vinculo.papel as Role,
    empresaId: vinculo.empresa_id,
  };
}
