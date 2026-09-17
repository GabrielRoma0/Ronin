/**
 * Funções puras de cálculo de CMV — sem nenhum import server-only, pra
 * poderem ser usadas direto por um componente client (CustoMercadoriaTab)
 * sem arrastar `next/headers` (via lib/supabase/server) pro bundle do
 * navegador. lib/data/cmv.ts reexporta os tipos daqui e cuida só da busca
 * de dados no servidor.
 */
export interface ComposicaoItem {
  id: string;
  insumoId: string;
  insumoNome: string;
  quantidade: number;
  custoUnitario: number;
}

export interface ItemCardapioReal {
  id: string;
  nome: string;
  precoVenda: number;
  ativo: boolean;
  composicao: ComposicaoItem[];
}

export function custoItem(item: ItemCardapioReal): number {
  return item.composicao.reduce((acc, c) => acc + c.quantidade * c.custoUnitario, 0);
}

export function margemItem(item: ItemCardapioReal): number {
  return item.precoVenda - custoItem(item);
}

export function cmvPercentual(item: ItemCardapioReal): number | null {
  if (item.precoVenda <= 0) return null;
  return custoItem(item) / item.precoVenda;
}
