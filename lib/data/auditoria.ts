import { createClient } from "@/lib/supabase/server";

/**
 * Registra "quem viu o quê" — chamado nas páginas de relatório depois que o
 * acesso já foi confirmado (nunca antes, nunca substitui a checagem de
 * sessão). Falha em registrar o log não pode derrubar a navegação: só
 * escreve no console do servidor e segue.
 */
export async function registrarAcesso(empresaId: string, acao: string): Promise<void> {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  if (!claims?.sub) return;

  const { error } = await supabase.from("logs_acesso").insert({
    user_id: claims.sub,
    user_email: typeof claims.email === "string" ? claims.email : null,
    empresa_id: empresaId,
    acao,
  });

  if (error) {
    console.error("Falha ao registrar log de acesso:", error.message);
  }
}

export interface LogAcesso {
  id: string;
  userEmail: string | null;
  empresaNome: string | null;
  acao: string;
  createdAt: string;
}

/**
 * Só admin consegue ler (política logs_acesso_select). `empresa_id` não tem
 * FK (ver migração logs_acesso_sem_fk_estrita), então o nome da empresa é
 * resolvido com uma segunda consulta em vez do embed automático do
 * PostgREST — que depende de uma FK existir para inferir o relacionamento.
 */
export async function listarLogsAcesso(limite = 100): Promise<LogAcesso[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("logs_acesso")
    .select("id, user_email, empresa_id, acao, created_at")
    .order("created_at", { ascending: false })
    .limit(limite);

  if (error) throw error;
  const logs = data ?? [];

  const empresaIds = Array.from(new Set(logs.map((l) => l.empresa_id).filter(Boolean)));
  const nomesPorId = new Map<string, string>();

  if (empresaIds.length > 0) {
    const { data: empresas, error: erroEmpresas } = await supabase
      .from("empresas")
      .select("id, nome")
      .in("id", empresaIds);
    if (erroEmpresas) throw erroEmpresas;
    for (const e of empresas ?? []) nomesPorId.set(e.id, e.nome);
  }

  return logs.map((l) => ({
    id: l.id,
    userEmail: l.user_email,
    empresaNome: l.empresa_id ? (nomesPorId.get(l.empresa_id) ?? null) : null,
    acao: l.acao,
    createdAt: l.created_at,
  }));
}
