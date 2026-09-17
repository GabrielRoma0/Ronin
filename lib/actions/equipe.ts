"use server";

import { getSessao } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface ResultadoAcaoEquipe {
  sucesso: boolean;
  erro?: string;
}

export interface MembroEquipe {
  userId: string;
  username: string | null;
  papel: "dono" | "funcionario";
}

/**
 * Recebe `empresaId` de quem já resolveu a sessão (app/conta/page.tsx já
 * checa `role === "dono"` antes de chamar) — antes esta função resolvia a
 * sessão de novo internamente, duplicando a consulta a `usuarios_empresas`
 * a cada carregamento de /conta (ver auditoria de N+1). Isolamento por
 * tenant continua garantido pela política de RLS de `usuarios_empresas`,
 * não por essa checagem.
 */
export async function listarEquipe(empresaId: string): Promise<MembroEquipe[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("usuarios_empresas")
    .select("user_id, username, papel")
    .eq("empresa_id", empresaId)
    .order("username");

  if (error) throw error;

  return (data ?? []).map((d) => ({
    userId: d.user_id,
    username: d.username,
    papel: d.papel as "dono" | "funcionario",
  }));
}

/**
 * "Esqueci a senha" nesta escala vira "o dono redefine na hora" — não há
 * e-mail real por trás das contas (login é por username, o e-mail no
 * auth.users é interno/sintético), então o fluxo padrão do Supabase de
 * mandar link por e-mail não teria pra onde mandar. Trocar a senha de
 * outra pessoa exige a Admin API (service role): antes de chamá-la,
 * confirma pelo client normal (respeitando RLS) que quem está pedindo é
 * dono e que o alvo pertence à mesma empresa — o admin client nunca decide
 * sozinho quem pode ser alterado.
 */
export async function redefinirSenhaMembro(
  userId: string,
  novaSenha: string,
): Promise<ResultadoAcaoEquipe> {
  if (novaSenha.length < 6) {
    return { sucesso: false, erro: "A senha precisa ter pelo menos 6 caracteres." };
  }

  const sessao = await getSessao();
  if (!sessao || sessao.role !== "dono") {
    return { sucesso: false, erro: "Sem permissão." };
  }

  const supabase = await createClient();
  const { data: vinculo } = await supabase
    .from("usuarios_empresas")
    .select("user_id")
    .eq("user_id", userId)
    .eq("empresa_id", sessao.empresaId)
    .maybeSingle();

  if (!vinculo) {
    return { sucesso: false, erro: "Usuário não encontrado nesta empresa." };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, { password: novaSenha });

  if (error) return { sucesso: false, erro: error.message };

  return { sucesso: true };
}
