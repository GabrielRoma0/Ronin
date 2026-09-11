import { getPeriodoReal, mesAnterior, mesAtual } from "@/lib/data/relatorio";
import { nomeMes } from "@/lib/format";
import type { Periodo } from "@/data/seed";

export interface LinhaComparativo {
  indicador: "Entradas" | "Saídas" | "Resultado";
  anterior: number;
  atual: number;
}

export interface ComparativoMesAMes {
  labelAnterior: string;
  labelAtual: string;
  linhas: LinhaComparativo[];
}

export interface PontoEvolucao {
  label: string;
  entradas: number;
  saidas: number;
  resultado: number;
}

export interface RefMes {
  mes: number;
  ano: number;
}

function labelMes({ mes, ano }: RefMes): string {
  return `${nomeMes(mes).slice(0, 3)}/${String(ano).slice(2)}`;
}

/**
 * Busca os últimos 6 meses (mês atual incluído) de uma vez só, em paralelo —
 * uma única rodada de consultas, reaproveitada pelo dashboard, pelo
 * comparativo mês a mês e pela evolução de 6 meses (antes cada um desses
 * três buscava o mês atual/anterior de novo por conta própria, triplicando
 * consultas idênticas ao Supabase a cada carregamento do /painel). Do mais
 * antigo pro mais recente — `periodos[5]` é sempre o mês atual.
 */
export async function getPeriodosUltimos6Meses(
  empresaId: string,
): Promise<{ periodos: Periodo[]; refs: RefMes[] }> {
  const refs: RefMes[] = [];
  let ref = mesAtual();
  for (let i = 0; i < 6; i++) {
    refs.unshift(ref);
    ref = mesAnterior(ref);
  }

  const periodos = await Promise.all(refs.map((r) => getPeriodoReal(empresaId, undefined, r)));
  return { periodos, refs };
}

/** Mês atual x mês anterior — os dois últimos elementos de getPeriodosUltimos6Meses. Puro, sem consulta nova. */
export function montarComparativoMesAMes(periodos: Periodo[], refs: RefMes[]): ComparativoMesAMes {
  const atual = periodos[periodos.length - 1];
  const anterior = periodos[periodos.length - 2];
  const refAtual = refs[refs.length - 1];
  const refAnterior = refs[refs.length - 2];

  return {
    labelAnterior: labelMes(refAnterior),
    labelAtual: labelMes(refAtual),
    linhas: [
      {
        indicador: "Entradas",
        anterior: anterior.indicadores.totalReceitas,
        atual: atual.indicadores.totalReceitas,
      },
      {
        indicador: "Saídas",
        anterior: Math.abs(anterior.indicadores.totalDespesas),
        atual: Math.abs(atual.indicadores.totalDespesas),
      },
      {
        indicador: "Resultado",
        anterior: anterior.indicadores.resultadoOperacional,
        atual: atual.indicadores.resultadoOperacional,
      },
    ],
  };
}

/**
 * Um ponto por mês pro gráfico "Evolução Financeira". Puro, sem consulta
 * nova — mês sem lançamento nenhum já chega zerado de verdade via
 * getPeriodoReal, nunca uma estimativa preenchida aqui.
 */
export function montarEvolucao6Meses(periodos: Periodo[], refs: RefMes[]): PontoEvolucao[] {
  return periodos.map((periodo, indice) => ({
    label: labelMes(refs[indice]),
    entradas: periodo.indicadores.totalReceitas,
    saidas: Math.abs(periodo.indicadores.totalDespesas),
    resultado: periodo.indicadores.resultadoOperacional,
  }));
}
