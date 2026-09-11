"use server";

import { getSessao } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export interface ResultadoAcaoConta {
  sucesso: boolean;
  erro?: string;
}

const REGEX_USERNAME = /^[a-z0-9._-]{3,32}$/;

/**
 * Cada usuário só troca o próprio username — nunca recebe um user_id vindo
 * do cliente, sempre o da própria sessão. A trava de verdade é o banco (ver
 * migração permite_usuario_trocar_proprio_username): RLS restringe a linha,
 * e um grant de coluna restringe pra só `username` ser atualizável, então
 * mesmo um bug aqui não abriria brecha pra mudar papel ou empresa.
 */
export async function atualizarUsername(novoUsername: string): Promise<ResultadoAcaoConta> {
  const normalizado = novoUsername.trim().toLowerCase();
  if (!REGEX_USERNAME.test(normalizado)) {
    return {
      sucesso: false,
      erro: "Usuário deve ter 3 a 32 caracteres: letras minúsculas, números, ponto, hífen ou underline.",
    };
  }

  const sessao = await getSessao();
  if (!sessao) return { sucesso: false, erro: "Sessão inválida." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("usuarios_empresas")
    .update({ username: normalizado })
    .eq("user_id", sessao.userId)
    .eq("empresa_id", sessao.empresaId);

  if (error) {
    if (error.code === "23505") return { sucesso: false, erro: "Esse nome de usuário já está em uso." };
    return { sucesso: false, erro: error.message };
  }

  return { sucesso: true };
}
