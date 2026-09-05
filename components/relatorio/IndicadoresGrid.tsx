import type { Indicadores } from "@/data/seed";
import { Valor } from "@/components/ui/Valor";

const ITENS: { chave: keyof Indicadores; label: string }[] = [
  { chave: "totalReceitas", label: "Total de Receitas" },
  { chave: "totalDespesas", label: "Total de Despesas" },
  { chave: "resultadoOperacional", label: "Resultado Operacional" },
  { chave: "distribuicaoLucros", label: "Distribuição de Lucros" },
  { chave: "resultadoFinal", label: "Resultado Final" },
];

export function IndicadoresGrid({ indicadores }: { indicadores: Indicadores }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {ITENS.map(({ chave, label }) => {
        const destaque = chave === "resultadoFinal";
        const valor = indicadores[chave];
        const corDestaque = destaque
          ? valor < 0
            ? "border-red-200 bg-red-50"
            : valor > 0
              ? "border-emerald-200 bg-emerald-50"
              : "border-ink-200 bg-paper-50"
          : "border-ink-200 bg-paper-50";
        return (
          <div key={chave} className={`rounded-xl border p-4 ${corDestaque}`}>
            <p className="text-xs font-medium text-ink-400">{label}</p>
            <div className="mt-2 text-lg">
              <Valor valor={valor} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
