import type { Periodo } from "@/data/seed";
import { formatBRL, formatPercent, nomeMes } from "@/lib/format";

/**
 * Versão para dados reais: só descreve o que existe de fato no período —
 * nenhuma comparação com "mês anterior" fictício. A comparação real entre
 * meses fica para quando houver histórico de verdade (Fase 3 do plano de
 * produção), não antes.
 */
export function AIReportCard({ periodo }: { periodo: Periodo }) {
  const semLancamentos =
    periodo.indicadores.totalReceitas === 0 && periodo.indicadores.totalDespesas === 0;

  const despesaTopo = [...periodo.despesas].sort(
    (a, b) => Math.abs(b.valor) - Math.abs(a.valor),
  )[0];
  const temDespesaRelevante = despesaTopo && despesaTopo.valor !== 0;

  return (
    <div className="rounded-2xl border border-brass-300 bg-brass-100/40 p-6">
      <div className="flex items-center gap-2">
        <span className="katana-mark font-display text-base font-semibold text-ink-900">
          Relatório com IA
        </span>
        <span className="rounded-full border border-brass-300 bg-white px-2 py-0.5 text-[11px] font-medium text-brass-700">
          Análise automática
        </span>
      </div>

      {semLancamentos ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-500">
          Ainda não há lançamentos em {nomeMes(periodo.mes)}/{periodo.ano} para gerar uma análise
          automática. Assim que o período tiver receitas ou despesas lançadas, um resumo aparece
          aqui.
        </p>
      ) : (
        <>
          <p className="mt-4 text-sm leading-relaxed text-ink-700">
            Em {nomeMes(periodo.mes)}/{periodo.ano}, as receitas somaram{" "}
            {formatBRL(periodo.indicadores.totalReceitas)} e as despesas somaram{" "}
            {formatBRL(periodo.indicadores.totalDespesas)}, resultando num resultado operacional de{" "}
            {formatBRL(periodo.indicadores.resultadoOperacional)}. Considerando a distribuição de
            lucros do período, o resultado final fechou em{" "}
            {formatBRL(periodo.indicadores.resultadoFinal)}.
          </p>

          {temDespesaRelevante && (
            <p className="mt-3 text-sm leading-relaxed text-ink-700">
              A categoria que mais pesou no mês foi <strong>{despesaTopo.categoria}</strong>,
              responsável por {formatPercent(despesaTopo.percentualDespesas ?? 0)} de todas as
              despesas.
            </p>
          )}
        </>
      )}

      <p className="mt-4 text-xs text-ink-400">
        Texto gerado automaticamente a partir dos lançamentos do período. Comparação com meses
        anteriores ainda não está disponível.
      </p>
    </div>
  );
}
