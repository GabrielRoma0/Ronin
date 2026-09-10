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

export async function getLancamentosReal(
  empresaId: string,
  contaId: string,
): Promise<LancamentoReal[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lancamentos")
    .select("id, data, descricao, categoria, valor")
    .eq("empresa_id", empresaId)
    .eq("conta_id", contaId)
    .order("data");

  if (error) throw error;
  return data ?? [];
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

  // Saldo é uma foto de banco, não algo somável a partir dos lançamentos —
  // sem conta informada (visão consolidada), soma os saldos conhecidos das
  // contas da empresa; sem nenhum saldo cadastrado ainda, fica null.
  const saldoFinal = await resolverSaldo(empresaId, contaId);

  return {
    mes: referencia.mes,
    ano: referencia.ano,
    indicadores,
    receitas,
    despesas,
    outrosMovimentos,
    saldoFinal,
  };
}

async function resolverSaldo(empresaId: string, contaId?: string): Promise<number | null> {
  const supabase = await createClient();
  let query = supabase.from("contas").select("saldo_atual").eq("empresa_id", empresaId);
  if (contaId) query = query.eq("id", contaId);

  const { data, error } = await query;
  if (error) throw error;
  if (!data || data.length === 0) return null;
  if (data.some((c) => c.saldo_atual === null)) return null;

  return data.reduce((acc, c) => acc + Number(c.saldo_atual), 0);
}

function mesAtual(): { mes: number; ano: number } {
  const agora = new Date();
  return { mes: agora.getUTCMonth() + 1, ano: agora.getUTCFullYear() };
}

function proximoMes({ mes, ano }: { mes: number; ano: number }): string {
  const proximo = mes === 12 ? { mes: 1, ano: ano + 1 } : { mes: mes + 1, ano };
  return `${proximo.ano}-${String(proximo.mes).padStart(2, "0")}-01`;
}
