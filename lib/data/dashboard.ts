import { calcularSaldoFinal, getPeriodoReal, mesAnterior, type ContaReal } from "@/lib/data/relatorio";
import type { Periodo } from "@/data/seed";

export interface KpiComDelta {
  valor: number | null;
  /** Fração (0.153 = 15,3%) — null quando não dá pra calcular (mês anterior zerado ou sem saldo). */
  deltaPercent: number | null;
}

export interface DashboardKPIs {
  entradas: KpiComDelta;
  saidas: KpiComDelta;
  resultadoDoMes: KpiComDelta;
  saldoEmContas: KpiComDelta;
}

function delta(atual: number, anterior: number): number | null {
  if (anterior === 0) return null;
  return (atual - anterior) / Math.abs(anterior);
}

function movimentoTotalDoMes(periodo: Periodo): number {
  return (
    periodo.indicadores.totalReceitas +
    periodo.indicadores.totalDespesas +
    periodo.outrosMovimentos.reduce((acc, m) => acc + m.valor, 0)
  );
}

function refMesAtual(): { mes: number; ano: number } {
  const agora = new Date();
  return { mes: agora.getUTCMonth() + 1, ano: agora.getUTCFullYear() };
}

/**
 * Os 4 KPIs do dashboard inicial do dono, mês atual x mês anterior. Tudo
 * derivado dos mesmos lançamentos/saldos já usados no resto do relatório —
 * "saldo do mês anterior" não é uma consulta nova, é o saldo atual menos a
 * movimentação (receitas + despesas + outros movimentos) do mês atual.
 */
export async function getDashboardKPIs(empresaId: string, contas: ContaReal[]): Promise<DashboardKPIs> {
  const refAtual = refMesAtual();
  const refAnterior = mesAnterior(refAtual);

  const [periodoAtual, periodoAnterior] = await Promise.all([
    getPeriodoReal(empresaId, undefined, refAtual),
    getPeriodoReal(empresaId, undefined, refAnterior),
  ]);

  const saldoAtual = calcularSaldoFinal(contas);
  const saldoAnterior = saldoAtual === null ? null : saldoAtual - movimentoTotalDoMes(periodoAtual);

  const saidasAtual = Math.abs(periodoAtual.indicadores.totalDespesas);
  const saidasAnterior = Math.abs(periodoAnterior.indicadores.totalDespesas);

  return {
    entradas: {
      valor: periodoAtual.indicadores.totalReceitas,
      deltaPercent: delta(periodoAtual.indicadores.totalReceitas, periodoAnterior.indicadores.totalReceitas),
    },
    saidas: {
      valor: periodoAtual.indicadores.totalDespesas,
      deltaPercent: delta(saidasAtual, saidasAnterior),
    },
    resultadoDoMes: {
      valor: periodoAtual.indicadores.resultadoOperacional,
      deltaPercent: delta(
        periodoAtual.indicadores.resultadoOperacional,
        periodoAnterior.indicadores.resultadoOperacional,
      ),
    },
    saldoEmContas: {
      valor: saldoAtual,
      deltaPercent: saldoAtual === null || saldoAnterior === null ? null : delta(saldoAtual, saldoAnterior),
    },
  };
}
