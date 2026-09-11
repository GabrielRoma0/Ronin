"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Categoria } from "@/data/categorias";

export interface LinhaParaImportar {
  data: string;
  descricao: string;
  categoria: Categoria;
  valor: number;
}

export interface ResultadoImportacao {
  sucesso: boolean;
  erro?: string;
  quantidade?: number;
}

/**
 * Grava lançamentos já conferidos pelo usuário (ver ImportarCsvForm — nunca
 * chamado direto a partir do parser, sempre depois da tela de revisão).
 * O isolamento por tenant aqui é a própria política de RLS de INSERT em
 * `lancamentos`: se `empresaId` não pertencer a quem está logado, o banco
 * recusa a escrita — este código não faz nenhuma checagem própria de posse.
 */
export async function importarLancamentos(
  empresaId: string,
  contaId: string,
  linhas: LinhaParaImportar[],
): Promise<ResultadoImportacao> {
  if (linhas.length === 0) {
    return { sucesso: false, erro: "Nenhuma linha para importar." };
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub as string | undefined;

  const registros = linhas.map((linha) => ({
    empresa_id: empresaId,
    conta_id: contaId,
    data: linha.data,
    descricao: linha.descricao,
    categoria: linha.categoria,
    valor: linha.valor,
    created_by: userId ?? null,
  }));

  const { error } = await supabase.from("lancamentos").insert(registros);
  if (error) {
    return { sucesso: false, erro: error.message };
  }

  revalidatePath("/painel");
  revalidatePath("/caixa");

  return { sucesso: true, quantidade: registros.length };
}
