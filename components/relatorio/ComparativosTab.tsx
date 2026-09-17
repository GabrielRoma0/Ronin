import type { ComparativoMesAMes as ComparativoMesAMesData, PontoEvolucao } from "@/lib/data/graficos";
import { ComparativoMesAMes } from "./ComparativoMesAMes";
import { EvolucaoFinanceira } from "./EvolucaoFinanceira";

export function ComparativosTab({
  comparativo,
  evolucao,
}: {
  comparativo: ComparativoMesAMesData;
  evolucao: PontoEvolucao[];
}) {
  return (
    <div className="flex flex-col gap-8">
      <section>
        <h3 className="mb-3 font-display text-lg font-semibold text-ink-900">
          Comparativo Mês x Mês
        </h3>
        <div className="rounded-xl border border-ink-200 bg-paper-50 p-4">
          <ComparativoMesAMes dados={comparativo} />
        </div>
      </section>

      <section>
        <h3 className="mb-3 font-display text-lg font-semibold text-ink-900">
          Evolução Financeira (últimos 6 meses)
        </h3>
        <div className="rounded-xl border border-ink-200 bg-paper-50 p-4">
          <EvolucaoFinanceira pontos={evolucao} />
        </div>
        <p className="mt-2 text-xs text-ink-400">
          Meses sem lançamento aparecem zerados — nenhum valor aqui é estimado.
        </p>
      </section>
    </div>
  );
}
