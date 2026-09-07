import type { Periodo } from "@/data/seed";
import { nomeMes } from "@/lib/format";
import { IndicadoresGrid } from "./IndicadoresGrid";
import { TabelaReceitas } from "./TabelaReceitas";
import { TabelaDespesas } from "./TabelaDespesas";
import { TabelaOutrosMovimentos } from "./TabelaOutrosMovimentos";

export function ResumoTab({
  periodo,
  subtitulo,
}: {
  periodo: Periodo;
  /** ex.: "Consolidado (Banco A + Banco B)" ou "Conta Banco A" */
  subtitulo: string;
}) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-brass-700">
          {subtitulo} · {nomeMes(periodo.mes)}/{periodo.ano}
        </p>
        <h2 className="mt-1 font-display text-2xl font-semibold text-ink-900">
          Indicadores do período
        </h2>
      </div>

      <IndicadoresGrid indicadores={periodo.indicadores} />

      <section>
        <h3 className="mb-3 font-display text-lg font-semibold text-ink-900">
          Receitas por grupo
        </h3>
        <TabelaReceitas receitas={periodo.receitas} />
      </section>

      <section>
        <h3 className="mb-3 font-display text-lg font-semibold text-ink-900">
          Despesas por grupo
        </h3>
        <TabelaDespesas despesas={periodo.despesas} />
      </section>

      <section>
        <h3 className="mb-3 font-display text-lg font-semibold text-ink-900">
          Outros Movimentos
        </h3>
        <TabelaOutrosMovimentos
          movimentos={periodo.outrosMovimentos}
          saldoFinal={periodo.saldoFinal}
        />
      </section>
    </div>
  );
}
