"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ResultadoAcaoSocio {
  sucesso: boolean;
  erro?: string;
}

export async function criarSocio(
  empresaId: string,
  nome: string,
  percentual: number,
): Promise<ResultadoAcaoSocio> {
  if (!nome.trim() || !(percentual > 0) || percentual > 100) {
    return { sucesso: false, erro: "Nome e um percentual entre 0 e 100 são obrigatórios." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("socios").insert({
    empresa_id: empresaId,
    nome: nome.trim(),
    percentual,
  });

  if (error) return { sucesso: false, erro: error.message };

  revalidatePath("/painel");
  return { sucesso: true };
}

export async function atualizarPercentualSocio(
  socioId: string,
  percentual: number,
): Promise<ResultadoAcaoSocio> {
  if (!(percentual > 0) || percentual > 100) {
    return { sucesso: false, erro: "Percentual precisa ficar entre 0 e 100." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("socios").update({ percentual }).eq("id", socioId);

  if (error) return { sucesso: false, erro: error.message };

  revalidatePath("/painel");
  return { sucesso: true };
}

export async function removerSocio(socioId: string): Promise<ResultadoAcaoSocio> {
  const supabase = await createClient();
  const { error } = await supabase.from("socios").delete().eq("id", socioId);

  if (error) return { sucesso: false, erro: error.message };

  revalidatePath("/painel");
  return { sucesso: true };
}
