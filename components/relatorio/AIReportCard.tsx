import type { Periodo } from "@/data/seed";
import { formatBRL, formatPercent } from "@/lib/format";

// Mês anterior fictício, usado só como referência de comparação no texto
// abaixo — não existe um Periodo completo de Julho/2026 nesta demo.
const JULHO_REFERENCIA = {
  totalReceitas: 112_500,
  totalDespesas: -92_000,
  resultadoOperacional: 20_500,
};

export function AIReportCard({ periodo }: { periodo: Periodo }) {
  const despesaTopo = [...periodo.despesas].sort(
    (a, b) => Math.abs(b.valor) - Math.abs(a.valor),
  )[0];

  const variacaoReceitas =
    periodo.indicadores.totalReceitas / JULHO_REFERENCIA.totalReceitas - 1;
  const variacaoDespesas =
    Math.abs(periodo.indicadores.totalDespesas) / Math.abs(JULHO_REFERENCIA.totalDespesas) - 1;
  const tendenciaQueda =
    periodo.indicadores.resultadoOperacional < JULHO_REFERENCIA.resultadoOperacional;

  return (
    <div className="rounded-2xl border border-brass-300 bg-brass-100/40 p-6">
      <div className="flex items-center gap-2">
        <span className="katana-mark font-display text-base font-semibold text-ink-900">
          Relatório com IA
        </span>
        <span className="rounded-full border border-brass-300 bg-white px-2 py-0.5 text-[11px] font-medium text-brass-700">
          Análise automática · dados de demonstração
        </span>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-ink-700">
        Em Agosto/2026, as receitas somaram {formatBRL(periodo.indicadores.totalReceitas)}, um
        crescimento de {formatPercent(Math.abs(variacaoReceitas))} frente a Julho. As despesas,
        porém, cresceram mais rápido — {formatPercent(Math.abs(variacaoDespesas))} no mesmo
        período —, o que{" "}
        {tendenciaQueda ? (
          <>
            derrubou o resultado operacional de {formatBRL(JULHO_REFERENCIA.resultadoOperacional)}{" "}
            em Julho para {formatBRL(periodo.indicadores.resultadoOperacional)} em Agosto.
          </>
        ) : (
          <>manteve o resultado operacional estável em torno de {formatBRL(periodo.indicadores.resultadoOperacional)}.</>
        )}{" "}
        Considerando a distribuição de lucros do período, o resultado final fechou em{" "}
        {formatBRL(periodo.indicadores.resultadoFinal)} — uma{" "}
        {periodo.indicadores.resultadoFinal < 0 ? "tendência de queda" : "tendência de crescimento"}{" "}
        que vale monitorar no próximo fechamento.
      </p>

      {despesaTopo && (
        <p className="mt-3 text-sm leading-relaxed text-ink-700">
          A categoria que mais pesou no mês foi <strong>{despesaTopo.categoria}</strong>,
          responsável por {formatPercent(despesaTopo.percentualDespesas ?? 0)} de todas as
          despesas — o principal ponto de atenção para o próximo período.
        </p>
      )}

      <p className="mt-4 text-xs text-ink-400">
        Texto gerado automaticamente a partir dos lançamentos do período, com fins ilustrativos.
        Nesta demonstração não há um modelo de IA real conectado.
      </p>
    </div>
  );
}
