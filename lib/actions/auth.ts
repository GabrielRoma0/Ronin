"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface ResultadoLogin {
  sucesso: boolean;
  erro?: string;
}

const ERRO_GENERICO = "Usuário ou senha inválidos.";

/**
 * Login por username em vez de e-mail. O e-mail real de cada conta nunca
 * chega ao navegador: é resolvido aqui, no servidor, com a secret key
 * (bypassa RLS, único jeito de ler `auth.users` e ler `username` antes de
 * existir sessão). O sign-in de fato usa o cliente normal (createClient),
 * que já grava os cookies de sessão corretamente. Qualquer falha em
 * qualquer etapa devolve o mesmo erro genérico — nunca revela se foi o
 * username ou a senha que estava errada.
 */
export async function entrarComUsername(username: string, senha: string): Promise<ResultadoLogin> {
  const usernameNormalizado = username.trim().toLowerCase();
  if (!usernameNormalizado || !senha) {
    return { sucesso: false, erro: ERRO_GENERICO };
  }

  const admin = createAdminClient();

  const { data: vinculo } = await admin
    .from("usuarios_empresas")
    .select("user_id")
    .eq("username", usernameNormalizado)
    .maybeSingle();

  if (!vinculo) {
    return { sucesso: false, erro: ERRO_GENERICO };
  }

  const { data: usuario, error: erroUsuario } = await admin.auth.admin.getUserById(vinculo.user_id);
  if (erroUsuario || !usuario?.user?.email) {
    return { sucesso: false, erro: ERRO_GENERICO };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: usuario.user.email,
    password: senha,
  });

  if (error) {
    return { sucesso: false, erro: ERRO_GENERICO };
  }

  return { sucesso: true };
}
