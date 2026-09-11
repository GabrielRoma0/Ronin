"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ResultadoAcaoConta {
  sucesso: boolean;
  erro?: string;
}

export async function criarConta(
  empresaId: string,
  banco: string,
  titular: string,
  cnpj: string,
  saldoAtual: number | null,
): Promise<ResultadoAcaoConta> {
  if (!banco.trim() || !titular.trim() || !cnpj.trim()) {
    return { sucesso: false, erro: "Banco, titular e CNPJ são obrigatórios." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contas").insert({
    empresa_id: empresaId,
    banco: banco.trim(),
    titular: titular.trim(),
    cnpj: cnpj.trim(),
    saldo_atual: saldoAtual,
  });

  if (error) return { sucesso: false, erro: error.message };

  revalidatePath("/painel");
  return { sucesso: true };
}
