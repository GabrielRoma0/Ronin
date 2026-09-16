"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ResultadoAcaoCmv {
  sucesso: boolean;
  erro?: string;
}

export async function criarInsumo(
  empresaId: string,
  nome: string,
  custoUnitario: number,
): Promise<ResultadoAcaoCmv> {
  if (!nome.trim() || !Number.isFinite(custoUnitario) || custoUnitario < 0) {
    return { sucesso: false, erro: "Nome e um custo unitário válido são obrigatórios." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("insumos").insert({
    empresa_id: empresaId,
    nome: nome.trim(),
    custo_unitario: custoUnitario,
  });

  if (error) return { sucesso: false, erro: error.message };

  revalidatePath("/painel");
  return { sucesso: true };
}

export async function atualizarCustoInsumo(
  insumoId: string,
  custoUnitario: number,
): Promise<ResultadoAcaoCmv> {
  if (!Number.isFinite(custoUnitario) || custoUnitario < 0) {
    return { sucesso: false, erro: "Custo unitário inválido." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("insumos")
    .update({ custo_unitario: custoUnitario })
    .eq("id", insumoId);

  if (error) return { sucesso: false, erro: error.message };

  revalidatePath("/painel");
  return { sucesso: true };
}

/**
 * Apagar falha (23503) se o insumo estiver em uso em algum item — de
 * propósito: a FK de itens_cardapio_insumos.insumo_id é ON DELETE RESTRICT,
 * então apagar quem compõe um item ativo perderia o custo dele silenciosamente.
 */
export async function removerInsumo(insumoId: string): Promise<ResultadoAcaoCmv> {
  const supabase = await createClient();
  const { error } = await supabase.from("insumos").delete().eq("id", insumoId);

  if (error) {
    if (error.code === "23503") {
      return {
        sucesso: false,
        erro: "Não dá pra apagar: esse insumo está usado na composição de algum item. Remova da composição primeiro.",
      };
    }
    return { sucesso: false, erro: error.message };
  }

  revalidatePath("/painel");
  return { sucesso: true };
}

export async function criarItemCardapio(
  empresaId: string,
  nome: string,
  precoVenda: number,
): Promise<ResultadoAcaoCmv> {
  if (!nome.trim() || !Number.isFinite(precoVenda) || precoVenda < 0) {
    return { sucesso: false, erro: "Nome e um preço de venda válido são obrigatórios." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("itens_cardapio").insert({
    empresa_id: empresaId,
    nome: nome.trim(),
    preco_venda: precoVenda,
  });

  if (error) return { sucesso: false, erro: error.message };

  revalidatePath("/painel");
  return { sucesso: true };
}

export async function atualizarPrecoItemCardapio(
  itemId: string,
  precoVenda: number,
): Promise<ResultadoAcaoCmv> {
  if (!Number.isFinite(precoVenda) || precoVenda < 0) {
    return { sucesso: false, erro: "Preço de venda inválido." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("itens_cardapio")
    .update({ preco_venda: precoVenda })
    .eq("id", itemId);

  if (error) return { sucesso: false, erro: error.message };

  revalidatePath("/painel");
  return { sucesso: true };
}

export async function definirItemCardapioAtivo(
  itemId: string,
  ativo: boolean,
): Promise<ResultadoAcaoCmv> {
  const supabase = await createClient();
  const { error } = await supabase.from("itens_cardapio").update({ ativo }).eq("id", itemId);
  if (error) return { sucesso: false, erro: error.message };

  revalidatePath("/painel");
  return { sucesso: true };
}

export async function removerItemCardapio(itemId: string): Promise<ResultadoAcaoCmv> {
  const supabase = await createClient();
  const { error } = await supabase.from("itens_cardapio").delete().eq("id", itemId);

  if (error) {
    if (error.code === "23503") {
      return {
        sucesso: false,
        erro: "Não dá pra apagar: já existem vendas registradas pra esse item.",
      };
    }
    return { sucesso: false, erro: error.message };
  }

  revalidatePath("/painel");
  return { sucesso: true };
}

export async function adicionarInsumoAoItem(
  itemId: string,
  insumoId: string,
  quantidade: number,
): Promise<ResultadoAcaoCmv> {
  if (!insumoId || !Number.isFinite(quantidade) || quantidade <= 0) {
    return { sucesso: false, erro: "Selecione o insumo e uma quantidade maior que zero." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("itens_cardapio_insumos")
    .upsert({ item_id: itemId, insumo_id: insumoId, quantidade }, { onConflict: "item_id,insumo_id" });

  if (error) return { sucesso: false, erro: error.message };

  revalidatePath("/painel");
  return { sucesso: true };
}

export async function removerInsumoDoItem(composicaoId: string): Promise<ResultadoAcaoCmv> {
  const supabase = await createClient();
  const { error } = await supabase.from("itens_cardapio_insumos").delete().eq("id", composicaoId);

  if (error) return { sucesso: false, erro: error.message };

  revalidatePath("/painel");
  return { sucesso: true };
}
