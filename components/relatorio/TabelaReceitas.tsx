import type { LinhaGrupo } from "@/data/seed";
import { Valor } from "@/components/ui/Valor";

export function TabelaReceitas({ receitas }: { receitas: LinhaGrupo[] }) {
  const total = receitas.reduce((acc, r) => acc + r.valor, 0);
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-ink-200 text-left text-xs uppercase tracking-wide text-ink-400">
          <th className="py-2 font-medium">Grupo de receita</th>
          <th className="py-2 text-right font-medium">Valor</th>
        </tr>
      </thead>
      <tbody>
        {receitas.map((r) => (
          <tr key={r.categoria} className="border-b border-ink-100 last:border-0">
            <td className="py-2.5 text-ink-700">{r.categoria}</td>
            <td className="py-2.5 text-right">
              <Valor valor={r.valor} />
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td className="pt-3 font-semibold text-ink-900">Total de Receitas</td>
          <td className="pt-3 text-right font-semibold">
            <Valor valor={total} />
          </td>
        </tr>
      </tfoot>
    </table>
  );
}
