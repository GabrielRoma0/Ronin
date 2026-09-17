import { createClient } from "@/lib/supabase/server";
import {
  CATEGORIAS_DESPESA,
  CATEGORIAS_INDICADOR_DISTRIBUICAO,
  CATEGORIAS_OUTRO,
  CATEGORIAS_RECEITA,
  type Categoria,
} from "@/data/categorias";
import type { Indicadores, LinhaGrupo, Periodo } from "@/data/seed";

/**
 * Camada de dados REAL (Postgres via Supabase) que substitui `getPeriodo` /
 * `getLancamentos` de `data/seed.ts` para as telas de produção. Continua
 * reaproveitando os tipos `Periodo`/`LinhaGrupo`/`Indicadores` (nenhum dos
 * dois referencia o tipo `Banco` fixo do mock) para não duplicar as
 * definições nem os componentes de UI que já leem esse formato.
 *
 * Todas as consultas usam o cliente autenticado da própria requisição — o
 * isolamento por tenant é sempre reforçado pela RLS da migração
 * `core_schema_multi_tenant`, nunca só pelo filtro aplicado aqui.
 *
 * Nenhuma função aqui inventa número: sem lançamento no banco, os totais
 * saem zerados de verdade — é o estado correto até dado real ser importado.
 */

export interface ContaReal {
  id: string;
  banco: string;
  titular: string;
  cnpj: string;
  saldoAtual: number | null;
}

export interface LancamentoReal {
  id: string;
  data: string;
  descricao: string;
  categoria: Categoria;
  valor: number;
}

export interface ContaBasica {
  id: string;
  banco: string;
}

/**
 * Versão sem saldo/titular/CNPJ, usada nas telas de lançamento (importação,
 * caixa do dia) — inclusive para o papel "funcionario", que não tem política
 * de SELECT em `contas` (só INSERT em `lancamentos`). A função
 * `private.listar_contas_basico` é SECURITY DEFINER, então funciona pra quem
 * só tem acesso de lançamento sem nunca expor o saldo da conta.
 */
export async function listarContasBasico(empresaId: string): Promise<ContaBasica[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("listar_contas_basico", {
    target_empresa_id: empresaId,
  });

  if (error) throw error;
  return (data ?? []).sort((a: ContaBasica, b: ContaBasica) => a.banco.localeCompare(b.banco));
}

export async function listarContasReal(empresaId: string): Promise<ContaReal[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contas")
    .select("id, banco, titular, cnpj, saldo_atual")
    .eq("empresa_id", empresaId)
    .order("banco");

  if (error) throw error;

  return (data ?? []).map((c) => ({
    id: c.id,
    banco: c.banco,
    titular: c.titular,
    cnpj: c.cnpj,
    saldoAtual: c.saldo_atual,
  }));
}

export interface CursorLancamentos {
  data: string;
  id: string;
}

export interface PaginaLancamentos {
  itens: LancamentoReal[];
  /** null = não há lançamento mais antigo que os já retornados. */
  proximoCursor: CursorLancamentos | null;
}

export const TAMANHO_PAGINA_LANCAMENTOS_PADRAO = 50;

/**
 * Paginado por cursor (data, id) em vez de OFFSET: a tela carrega os N mais
 * recentes e só busca mais quando o dono pede ("carregar mais"), em vez de
 * trazer o histórico inteiro da conta a cada carregamento de `/painel` — uma
 * hamburgueria real acumula lançamento por venda/despesa todo dia, então esse
 * histórico só cresce. Cursor (não OFFSET) evita pular ou duplicar linha
 * quando um lançamento novo é inserido entre um "carregar mais" e outro.
 */
export async function getLancamentosPaginado(
  empresaId: string,
  contaId: string,
  opts: { limite?: number; antesDe?: CursorLancamentos } = {},
): Promise<PaginaLancamentos> {
  const limite = opts.limite ?? TAMANHO_PAGINA_LANCAMENTOS_PADRAO;
  const supabase = await createClient();

  let query = supabase
    .from("lancamentos")
    .select("id, data, descricao, categoria, valor")
    .eq("empresa_id", empresaId)
    .eq("conta_id", contaId)
    .order("data", { ascending: false })
    .order("id", { ascending: false })
    .limit(limite + 1); // +1 só pra saber se há próxima página, não entra na resposta

  if (opts.antesDe) {
    query = query.or(
      `data.lt.${opts.antesDe.data},and(data.eq.${opts.antesDe.data},id.lt.${opts.antesDe.id})`,
    );
  }

  const { data, error } = await query;
  if (error) throw error;

  const linhas = data ?? [];
  const temMais = linhas.length > limite;
  const itens = temMais ? linhas.slice(0, limite) : linhas;
  const ultimo = itens[itens.length - 1];

  return {
    itens,
    proximoCursor: temMais && ultimo ? { data: ultimo.data, id: ultimo.id } : null,
  };
}

function somaCategoria(lancamentos: LancamentoReal[], categoria: Categoria): number {
  return lancamentos.filter((l) => l.categoria === categoria).reduce((acc, l) => acc + l.valor, 0);
}

function arredonda(valor: number): number {
  return Math.round(valor * 100) / 100;
}

/**
 * Monta o Periodo (resumo) de uma empresa a partir dos lançamentos reais no
 * banco. `contaId` explícito filtra para uma conta; omitido, soma todas as
 * contas da empresa (visão consolidada). Sempre devolve um Periodo — com
 * zero em tudo quando não há lançamento nenhum, nunca `undefined`.
 *
 * `saldoFinal` não é buscado aqui — sai sempre null; quem chama já tem a
 * lista de contas (com `saldoAtual`) carregada e usa `calcularSaldoFinal`
 * pra preencher isso sem repetir uma consulta que o próprio chamador já fez.
 */
export async function getPeriodoReal(
  empresaId: string,
  contaId?: string,
  referencia: { mes: number; ano: number } = mesAtual(),
): Promise<Periodo> {
  const supabase = await createClient();

  let query = supabase
    .from("lancamentos")
    .select("id, data, descricao, categoria, valor")
    .eq("empresa_id", empresaId)
    .gte("data", `${referencia.ano}-${String(referencia.mes).padStart(2, "0")}-01`)
    .lt("data", proximoMes(referencia));

  if (contaId) query = query.eq("conta_id", contaId);

  const { data, error } = await query;
  if (error) throw error;
  const lancamentos: LancamentoReal[] = data ?? [];

  const receitas: LinhaGrupo[] = CATEGORIAS_RECEITA.map((categoria) => ({
    categoria,
    valor: arredonda(somaCategoria(lancamentos, categoria)),
  }));

  const totalDespesasBruto = CATEGORIAS_DESPESA.reduce(
    (acc, categoria) => acc + somaCategoria(lancamentos, categoria),
    0,
  );

  const despesas: LinhaGrupo[] = CATEGORIAS_DESPESA.map((categoria) => {
    const valor = arredonda(somaCategoria(lancamentos, categoria));
    const percentualDespesas =
      totalDespesasBruto !== 0 ? Math.abs(valor) / Math.abs(totalDespesasBruto) : 0;
    return { categoria, valor, percentualDespesas };
  });

  const outrosMovimentos: LinhaGrupo[] = CATEGORIAS_OUTRO.map((categoria) => ({
    categoria,
    valor: arredonda(somaCategoria(lancamentos, categoria)),
  }));

  const totalReceitas = arredonda(receitas.reduce((acc, r) => acc + r.valor, 0));
  const totalDespesas = arredonda(totalDespesasBruto);
  const resultadoOperacional = arredonda(totalReceitas + totalDespesas);
  const distribuicaoLucros = arredonda(
    CATEGORIAS_INDICADOR_DISTRIBUICAO.reduce(
      (acc, categoria) => acc + somaCategoria(lancamentos, categoria),
      0,
    ),
  );
  const resultadoFinal = arredonda(resultadoOperacional + distribuicaoLucros);

  const indicadores: Indicadores = {
    totalReceitas,
    totalDespesas,
    resultadoOperacional,
    distribuicaoLucros,
    resultadoFinal,
  };

  return {
    mes: referencia.mes,
    ano: referencia.ano,
    indicadores,
    receitas,
    despesas,
    outrosMovimentos,
    saldoFinal: null,
  };
}

/**
 * Saldo é uma foto de banco, não algo somável a partir dos lançamentos.
 * Puramente síncrono — soma o `saldoAtual` das contas já carregadas
 * (`listarContasReal`), sem repetir consulta nenhuma. `contaId` explícito
 * soma só aquela conta; omitido, soma todas.
 */
export function calcularSaldoFinal(contas: ContaReal[], contaId?: string): number | null {
  const relevantes = contaId ? contas.filter((c) => c.id === contaId) : contas;
  if (relevantes.length === 0) return null;
  if (relevantes.some((c) => c.saldoAtual === null)) return null;
  return relevantes.reduce((acc, c) => acc + Number(c.saldoAtual), 0);
}

export function mesAtual(): { mes: number; ano: number } {
  const agora = new Date();
  return { mes: agora.getUTCMonth() + 1, ano: agora.getUTCFullYear() };
}

/** Mês imediatamente anterior a uma referência — usado pra calcular a variação % do dashboard. */
export function mesAnterior({ mes, ano }: { mes: number; ano: number }): { mes: number; ano: number } {
  return mes === 1 ? { mes: 12, ano: ano - 1 } : { mes: mes - 1, ano };
}

function proximoMes({ mes, ano }: { mes: number; ano: number }): string {
  const proximo = mes === 12 ? { mes: 1, ano: ano + 1 } : { mes: mes + 1, ano };
  return `${proximo.ano}-${String(proximo.mes).padStart(2, "0")}-01`;
}
