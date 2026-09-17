"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ResultadoImportacaoVendas {
  sucesso: boolean;
  quantidade?: number;
  erro?: string;
}

export interface LinhaVendaParaImportar {
  itemId: string;
  data: string;
  quantidade: number;
  valorTotal: number;
}

export async function importarVendasItem(
  empresaId: string,
  linhas: LinhaVendaParaImportar[],
): Promise<ResultadoImportacaoVendas> {
  if (linhas.length === 0) {
    return { sucesso: false, erro: "Nenhuma linha pra importar." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("vendas_item").insert(
    linhas.map((l) => ({
      empresa_id: empresaId,
      item_id: l.itemId,
      data: l.data,
      quantidade: l.quantidade,
      valor_total: l.valorTotal,
      origem: "99food",
    })),
  );

  if (error) return { sucesso: false, erro: error.message };

  revalidatePath("/painel");
  return { sucesso: true, quantidade: linhas.length };
}
