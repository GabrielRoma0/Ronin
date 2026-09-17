import { createClient } from "@/lib/supabase/server";
import type { ItemCardapioReal } from "@/lib/cmvCalculos";

export type { ComposicaoItem, ItemCardapioReal } from "@/lib/cmvCalculos";
export { custoItem, margemItem, cmvPercentual } from "@/lib/cmvCalculos";

export interface InsumoReal {
  id: string;
  nome: string;
  custoUnitario: number;
}

export async function listarInsumosReal(empresaId: string): Promise<InsumoReal[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("insumos")
    .select("id, nome, custo_unitario")
    .eq("empresa_id", empresaId)
    .order("nome");

  if (error) throw error;

  return (data ?? []).map((i) => ({
    id: i.id,
    nome: i.nome,
    custoUnitario: Number(i.custo_unitario),
  }));
}

/**
 * Itens do cardápio já vêm com a composição embutida (join simples) —
 * evita N+1 consultas pra montar a tela, já que o custo de cada item
 * depende de somar seus insumos.
 */
export async function listarItensCardapioReal(empresaId: string): Promise<ItemCardapioReal[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("itens_cardapio")
    .select(
      "id, nome, preco_venda, ativo, itens_cardapio_insumos(id, insumo_id, quantidade, insumos(nome, custo_unitario))",
    )
    .eq("empresa_id", empresaId)
    .order("nome");

  if (error) throw error;

  return (data ?? []).map((item) => ({
    id: item.id,
    nome: item.nome,
    precoVenda: Number(item.preco_venda),
    ativo: item.ativo,
    composicao: (item.itens_cardapio_insumos ?? []).map((c) => ({
      id: c.id,
      insumoId: c.insumo_id,
      insumoNome: (c.insumos as unknown as { nome: string })?.nome ?? "—",
      quantidade: Number(c.quantidade),
      custoUnitario: Number((c.insumos as unknown as { custo_unitario: number })?.custo_unitario ?? 0),
    })),
  }));
}
