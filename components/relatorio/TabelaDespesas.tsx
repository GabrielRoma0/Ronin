import dynamic from "next/dynamic";
import type { LinhaGrupo } from "@/data/seed";
import { Valor } from "@/components/ui/Valor";
import { formatPercent } from "@/lib/format";

/**
 * Sob demanda: é o único ponto que ainda puxava o Recharts (~430KB) pro
 * carregamento inicial do Dashboard, mesmo com Comparativos/Funcionários já
 * carregando sob demanda — a tabela de despesas em si (o que a maioria olha
 * primeiro) não precisa esperar o gráfico pra aparecer.
 */
const DespesasChart = dynamic(() => import("./DespesasChart").then((m) => m.DespesasChart), {
  ssr: false,
  loading: () => <div className="min-h-[220px] animate-pulse rounded-xl bg-paper-200" />,
});

export function TabelaDespesas({ despesas }: { despesas: LinhaGrupo[] }) {
  const total = despesas.reduce((acc, d) => acc + d.valor, 0);
  const ordenadas = [...despesas].sort((a, b) => Math.abs(b.valor) - Math.abs(a.valor));

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-sm">
          <thead>
            <tr className="border-b border-ink-200 text-left text-xs uppercase tracking-wide text-ink-400">
              <th scope="col" className="py-2 font-medium">Grupo de despesa</th>
              <th scope="col" className="py-2 text-right font-medium">% despesas</th>
              <th scope="col" className="py-2 text-right font-medium">Valor</th>
            </tr>
          </thead>
          <tbody>
            {ordenadas.map((d) => (
              <tr key={d.categoria} className="border-b border-ink-100 last:border-0">
                <td className="py-2.5 text-ink-700">{d.categoria}</td>
                <td className="py-2.5 text-right text-ink-400">
                  {formatPercent(d.percentualDespesas ?? 0)}
                </td>
                <td className="py-2.5 text-right">
                  <Valor valor={d.valor} />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="pt-3 font-semibold text-ink-900">Total de Despesas</td>
              <td />
              <td className="pt-3 text-right font-semibold">
                <Valor valor={total} />
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <DespesasChart despesas={despesas} />
    </div>
  );
}
