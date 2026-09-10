"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ResultadoAcaoEmpresa {
  sucesso: boolean;
  erro?: string;
  empresaId?: string;
}

/** Só admin cadastra empresa nova — política de RLS (empresas_insert) já reforça isso no banco. */
export async function criarEmpresa(nome: string, cnpj: string): Promise<ResultadoAcaoEmpresa> {
  if (!nome.trim() || !cnpj.trim()) {
    return { sucesso: false, erro: "Nome e CNPJ são obrigatórios." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("empresas")
    .insert({ nome: nome.trim(), cnpj: cnpj.trim() })
    .select("id")
    .single();

  if (error) return { sucesso: false, erro: error.message };

  revalidatePath("/admin");
  return { sucesso: true, empresaId: data.id };
}
