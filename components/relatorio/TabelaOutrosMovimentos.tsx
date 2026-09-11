import type { LinhaGrupo } from "@/data/seed";
import { Valor } from "@/components/ui/Valor";

export function TabelaOutrosMovimentos({
  movimentos,
  saldoFinal,
}: {
  movimentos: LinhaGrupo[];
  saldoFinal: number | null;
}) {
  const total = movimentos.reduce((acc, m) => acc + m.valor, 0);
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-sm">
          <thead>
            <tr className="border-b border-ink-200 text-left text-xs uppercase tracking-wide text-ink-400">
              <th className="py-2 font-medium">Outros Movimentos</th>
              <th className="py-2 text-right font-medium">Valor</th>
            </tr>
          </thead>
          <tbody>
            {movimentos.map((m) => (
              <tr key={m.categoria} className="border-b border-ink-100 last:border-0">
                <td className="py-2.5 text-ink-700">{m.categoria}</td>
                <td className="py-2.5 text-right">
                  <Valor valor={m.valor} />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="pt-3 font-semibold text-ink-900">Total Outros Movimentos</td>
              <td className="pt-3 text-right font-semibold">
                <Valor valor={total} />
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="mt-2 text-xs text-ink-300">
        Não entram no cálculo de Receitas, Despesas ou Resultado Operacional.
      </p>

      <div className="mt-6 flex items-center justify-between rounded-xl border border-ink-200 bg-paper-50 px-5 py-4">
        <span className="text-sm font-medium text-ink-500">Saldo em conta ao final do período</span>
        <span className="text-lg">
          {saldoFinal === null ? (
            <span className="text-sm font-medium text-ink-300">Não informado</span>
          ) : (
            <Valor valor={saldoFinal} />
          )}
        </span>
      </div>
    </div>
  );
}
