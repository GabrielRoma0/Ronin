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
  usuario: string | null;
  empresaNome: string | null;
  acao: string;
  createdAt: string;
}

export interface CursorLogsAcesso {
  createdAt: string;
  id: string;
}

export interface PaginaLogsAcesso {
  itens: LogAcesso[];
  /** null = não há log mais antigo que os já retornados. */
  proximoCursor: CursorLogsAcesso | null;
}

/**
 * Só admin consegue ler (política logs_acesso_select). `empresa_id` não tem
 * FK (ver migração logs_acesso_sem_fk_estrita), então o nome da empresa é
 * resolvido com uma segunda consulta em vez do embed automático do
 * PostgREST — que depende de uma FK existir para inferir o relacionamento.
 *
 * `user_email` guardado no log é o e-mail interno/sintético do login por
 * username (ex.: "dono1@ronin.staff") — nunca deve aparecer na UI (mesma
 * regra de lib/auth.ts). O nome exibido é resolvido de volta pro username
 * real via usuarios_empresas (user_id + empresa_id); sem essa linha (conta
 * antiga sem username, ou já removida), cai pra "—".
 *
 * Paginado por cursor (created_at, id) via `?antes=` na URL — cada acesso ao
 * sistema grava uma linha nova aqui, então sem isso os logs antes do 100º
 * mais recente ficariam inacessíveis pela UI pra sempre.
 */
export async function listarLogsAcesso(
  opts: { limite?: number; antesDe?: CursorLogsAcesso } = {},
): Promise<PaginaLogsAcesso> {
  const limite = opts.limite ?? 100;
  const supabase = await createClient();
  let query = supabase
    .from("logs_acesso")
    .select("id, user_id, empresa_id, acao, created_at")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limite + 1); // +1 só pra saber se há próxima página, não entra na resposta

  if (opts.antesDe) {
    query = query.or(
      `created_at.lt.${opts.antesDe.createdAt},and(created_at.eq.${opts.antesDe.createdAt},id.lt.${opts.antesDe.id})`,
    );
  }

  const { data, error } = await query;
  if (error) throw error;

  const temMais = (data ?? []).length > limite;
  const logs = temMais ? (data ?? []).slice(0, limite) : (data ?? []);

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

  const usernamesPorChave = new Map<string, string>();
  if (logs.length > 0) {
    const { data: vinculos, error: erroVinculos } = await supabase
      .from("usuarios_empresas")
      .select("user_id, empresa_id, username");
    if (erroVinculos) throw erroVinculos;
    for (const v of vinculos ?? []) {
      if (v.username) usernamesPorChave.set(`${v.user_id}|${v.empresa_id}`, v.username);
    }
  }

  const itens = logs.map((l) => ({
    id: l.id,
    usuario: l.user_id && l.empresa_id ? (usernamesPorChave.get(`${l.user_id}|${l.empresa_id}`) ?? null) : null,
    empresaNome: l.empresa_id ? (nomesPorId.get(l.empresa_id) ?? null) : null,
    acao: l.acao,
    createdAt: l.created_at,
  }));

  const ultimo = logs[logs.length - 1];
  return {
    itens,
    proximoCursor: temMais && ultimo ? { createdAt: ultimo.created_at, id: ultimo.id } : null,
  };
}
