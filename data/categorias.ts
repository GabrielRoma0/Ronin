export type Banco = "Itaú" | "Santander";

export type Grupo = "receita" | "despesa" | "outro";

export const CATEGORIAS_RECEITA = [
  "Vendas",
  "Receitas Financeiras",
  "Outras Receitas",
] as const;

export const CATEGORIAS_DESPESA = [
  "Compras de Mercadorias",
  "Pessoal",
  "Impostos e Taxas",
  "Despesas Financeiras e Bancárias",
  "Materiais e Suprimentos",
  "Serviços Profissionais e Assinaturas",
  "Manutenção e Reparos",
  "Combustível e Transporte",
  "Seguros",
  "Telefonia e Internet",
  "Aluguel",
  "Alimentação",
  "Marketing",
  "Frete",
  "Outras Despesas",
] as const;

export const CATEGORIAS_OUTRO = [
  "Distribuição de Lucros",
  "Despesas do Sócio",
  "Empréstimos Concedidos",
  "Empréstimos Recebidos",
  "Aquisição de Equipamentos",
  "Transferência entre Contas",
  "Estorno de Valores",
  "Estorno de Vendas",
] as const;

export type CategoriaReceita = (typeof CATEGORIAS_RECEITA)[number];
export type CategoriaDespesa = (typeof CATEGORIAS_DESPESA)[number];
export type CategoriaOutro = (typeof CATEGORIAS_OUTRO)[number];
export type Categoria = CategoriaReceita | CategoriaDespesa | CategoriaOutro;

export function grupoDaCategoria(categoria: Categoria): Grupo {
  if ((CATEGORIAS_RECEITA as readonly string[]).includes(categoria)) return "receita";
  if ((CATEGORIAS_DESPESA as readonly string[]).includes(categoria)) return "despesa";
  return "outro";
}

/** Categorias de "Outros Movimentos" que compõem o indicador "Distribuição de Lucros" do período. */
export const CATEGORIAS_INDICADOR_DISTRIBUICAO: Categoria[] = [
  "Distribuição de Lucros",
  "Despesas do Sócio",
];

/** Cores para os gráficos de despesas por grupo (paleta neutra, sem depender só de matiz). */
export const CORES_GRUPO_DESPESA: Record<CategoriaDespesa, string> = {
  "Compras de Mercadorias": "#1B2333",
  "Pessoal": "#9C7A3C",
  "Impostos e Taxas": "#5B6478",
  "Despesas Financeiras e Bancárias": "#B08F55",
  "Materiais e Suprimentos": "#7C879A",
  "Serviços Profissionais e Assinaturas": "#C7A868",
  "Manutenção e Reparos": "#3D4763",
  "Combustível e Transporte": "#8A6A32",
  "Seguros": "#A3ACBD",
  "Telefonia e Internet": "#6F5A2E",
  "Aluguel": "#2A3348",
  "Alimentação": "#D9C79A",
  "Marketing": "#4C5771",
  "Frete": "#BFB08A",
  "Outras Despesas": "#96A0B2",
};
