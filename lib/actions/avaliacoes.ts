"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ResultadoAcaoAvaliacao {
  sucesso: boolean;
  erro?: string;
}

/**
 * Uma nota (0-10) por funcionário por dia — o dono lança manualmente a cada
 * quinzena. Upsert por (funcionario_id, data): relançar a mesma data corrige
 * a nota em vez de duplicar linha na linha do tempo.
 */
export async function registrarAvaliacao(
  empresaId: string,
  funcionarioId: string,
  data: string,
  nota: number,
): Promise<ResultadoAcaoAvaliacao> {
  if (!funcionarioId || !data) {
    return { sucesso: false, erro: "Selecione o funcionário e a data." };
  }
  if (!Number.isFinite(nota) || nota < 0 || nota > 10) {
    return { sucesso: false, erro: "A nota precisa ficar entre 0 e 10." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("avaliacoes_funcionario")
    .upsert(
      { empresa_id: empresaId, funcionario_id: funcionarioId, data, nota },
      { onConflict: "funcionario_id,data" },
    );

  if (error) return { sucesso: false, erro: error.message };

  revalidatePath("/painel");
  return { sucesso: true };
}
