"use client";

import { Fragment, useState } from "react";
import dynamic from "next/dynamic";
import type { LinhaGrupo, LinhaSubgrupo } from "@/data/seed";
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

export function TabelaDespesas({
  despesas,
  pessoalDetalhado,
}: {
  despesas: LinhaGrupo[];
  pessoalDetalhado?: LinhaSubgrupo[];
}) {
  const total = despesas.reduce((acc, d) => acc + d.valor, 0);
  const ordenadas = [...despesas].sort((a, b) => Math.abs(b.valor) - Math.abs(a.valor));
  const [pessoalAberto, setPessoalAberto] = useState(false);
  const totalPessoalAbs = (pessoalDetalhado ?? []).reduce((acc, s) => acc + Math.abs(s.valor), 0);

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
            {ordenadas.map((d) => {
              const ehPessoal = d.categoria === "Pessoal";
              const temDetalhe = ehPessoal && (pessoalDetalhado?.length ?? 0) > 0;

              return (
                <Fragment key={d.categoria}>
                  <tr className="border-b border-ink-100 last:border-0">
                    <td className="py-2.5 text-ink-700">
                      {temDetalhe ? (
                        <button
                          type="button"
                          onClick={() => setPessoalAberto((aberto) => !aberto)}
                          aria-expanded={pessoalAberto}
                          aria-label={`${pessoalAberto ? "Ocultar" : "Ver"} detalhamento de Pessoal por Salário, Condução e Horas Extras`}
                          className="flex items-center gap-1.5 rounded text-ink-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-600"
                        >
                          <span
                            aria-hidden="true"
                            className={`inline-block text-ink-400 transition-transform ${pessoalAberto ? "rotate-90" : ""}`}
                          >
                            ▸
                          </span>
                          {d.categoria}
                        </button>
                      ) : (
                        d.categoria
                      )}
                    </td>
                    <td className="py-2.5 text-right text-ink-400">
                      {formatPercent(d.percentualDespesas ?? 0)}
                    </td>
                    <td className="py-2.5 text-right">
                      <Valor valor={d.valor} />
                    </td>
                  </tr>
                  {temDetalhe &&
                    pessoalAberto &&
                    pessoalDetalhado!.map((sub) => {
                      const larguraPct =
                        totalPessoalAbs > 0 ? (Math.abs(sub.valor) / totalPessoalAbs) * 100 : 0;
                      return (
                        <tr key={sub.rotulo} className="border-b border-ink-100 bg-paper-50 last:border-0">
                          <td className="py-1.5 pl-7 text-xs text-ink-500">
                            <div className="flex items-center gap-2">
                              <span className="w-20 shrink-0">{sub.rotulo}</span>
                              <span className="h-1.5 max-w-[100px] flex-1 rounded-full bg-paper-200">
                                <span
                                  className="block h-1.5 rounded-full bg-brass-400"
                                  style={{ width: `${larguraPct}%` }}
                                />
                              </span>
                            </div>
                          </td>
                          <td />
                          <td className="py-1.5 text-right text-xs text-ink-500">
                            <Valor valor={sub.valor} />
                          </td>
                        </tr>
                      );
                    })}
                </Fragment>
              );
            })}
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
