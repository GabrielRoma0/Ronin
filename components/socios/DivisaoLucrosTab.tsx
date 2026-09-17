"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SocioReal } from "@/lib/data/socios";
import { atualizarPercentualSocio, criarSocio, removerSocio } from "@/lib/actions/socios";
import { formatBRL, formatPercent, nomeMes } from "@/lib/format";

export function DivisaoLucrosTab({
  empresaId,
  socios,
  resultadoOperacional,
  mes,
  ano,
}: {
  empresaId: string;
  socios: SocioReal[];
  resultadoOperacional: number;
  mes: number;
  ano: number;
}) {
  const router = useRouter();
  const [editando, setEditando] = useState<Record<string, string>>({});
  const [salvandoId, setSalvandoId] = useState<string | null>(null);
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null);
  const [nomeNovo, setNomeNovo] = useState("");
  const [percentualNovo, setPercentualNovo] = useState("");
  const [criando, setCriando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const somaPercentual = socios.reduce((acc, s) => acc + s.percentual, 0);

  async function handleSalvarPercentual(socioId: string) {
    const bruto = editando[socioId];
    const numero = Number(bruto.replace(",", "."));
    if (!Number.isFinite(numero) || numero <= 0 || numero > 100) {
      setErro("Percentual precisa ficar entre 0 e 100.");
      return;
    }

    setSalvandoId(socioId);
    setErro(null);
    const resposta = await atualizarPercentualSocio(socioId, numero);
    setSalvandoId(null);

    if (resposta.sucesso) {
      setEditando((atual) => {
        const resto = { ...atual };
        delete resto[socioId];
        return resto;
      });
      router.refresh();
    } else {
      setErro(resposta.erro ?? "Não foi possível salvar.");
    }
  }

  async function handleRemover(socioId: string) {
    setSalvandoId(socioId);
    const resposta = await removerSocio(socioId);
    setSalvandoId(null);
    setConfirmandoId(null);
    if (resposta.sucesso) router.refresh();
    else setErro(resposta.erro ?? "Não foi possível remover.");
  }

  async function handleCriar(e: React.FormEvent) {
    e.preventDefault();
    const numero = Number(percentualNovo.replace(",", "."));
    if (!nomeNovo.trim() || !Number.isFinite(numero) || numero <= 0 || numero > 100) {
      setErro("Informe nome e um percentual entre 0 e 100.");
      return;
    }

    setCriando(true);
    setErro(null);
    const resposta = await criarSocio(empresaId, nomeNovo, numero);
    setCriando(false);

    if (resposta.sucesso) {
      setNomeNovo("");
      setPercentualNovo("");
      router.refresh();
    } else {
      setErro(resposta.erro ?? "Não foi possível adicionar.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-brass-700">
          {nomeMes(mes)}/{ano}
        </p>
        <h2 className="mt-1 font-display text-2xl font-semibold text-ink-900">Divisão de Lucros</h2>
        <p className="mt-1 text-sm text-ink-400">
          Percentual fixo de cada sócio sobre o Resultado Operacional do período — quanto já foi
          efetivamente retirado é o que aparece como &ldquo;Distribuição de Lucros&rdquo; e
          &ldquo;Despesas do Sócio&rdquo; no resumo, não este cálculo.
        </p>
      </div>

      <div className="rounded-xl border border-ink-200 bg-paper-50 p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-400">
          Resultado Operacional do período
        </p>
        <p className="tabular-money mt-1 text-2xl font-semibold text-ink-900">
          {formatBRL(resultadoOperacional)}
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-ink-200">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b border-ink-200 bg-paper-50 text-left text-xs uppercase tracking-wide text-ink-400">
              <th scope="col" className="px-4 py-2.5 font-medium">Sócio</th>
              <th scope="col" className="px-4 py-2.5 font-medium">Percentual</th>
              <th scope="col" className="px-4 py-2.5 text-right font-medium">Valor no período</th>
              <th scope="col" className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {socios.map((socio) => {
              const emEdicao = editando[socio.id] !== undefined;
              const valor = resultadoOperacional * (socio.percentual / 100);
              return (
                <tr key={socio.id} className="border-b border-ink-100 last:border-0">
                  <td className="px-4 py-2.5 text-ink-700">{socio.nome}</td>
                  <td className="px-4 py-2.5">
                    {emEdicao ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={editando[socio.id]}
                          onChange={(e) =>
                            setEditando((atual) => ({ ...atual, [socio.id]: e.target.value }))
                          }
                          className="w-16 rounded-md border border-ink-200 bg-white px-2 py-1 text-xs"
                        />
                        <span className="text-xs text-ink-400">%</span>
                      </div>
                    ) : (
                      <span>{formatPercent(socio.percentual / 100)}</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <span className="tabular-money font-medium text-ink-700">{formatBRL(valor)}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs">
                    {emEdicao ? (
                      <button
                        type="button"
                        disabled={salvandoId === socio.id}
                        onClick={() => handleSalvarPercentual(socio.id)}
                        aria-label={`Salvar percentual de ${socio.nome}`}
                        title={`Salvar percentual de ${socio.nome}`}
                        className="rounded font-medium text-brass-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-600"
                      >
                        salvar
                      </button>
                    ) : confirmandoId === socio.id ? (
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          disabled={salvandoId === socio.id}
                          onClick={() => handleRemover(socio.id)}
                          aria-label={`Confirmar exclusão definitiva do sócio ${socio.nome}`}
                          title={`Confirmar exclusão definitiva do sócio ${socio.nome}`}
                          className="rounded font-medium text-red-600 hover:underline disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-600"
                        >
                          {salvandoId === socio.id ? "Apagando…" : "Confirmar?"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmandoId(null)}
                          aria-label={`Cancelar exclusão de ${socio.nome}`}
                          title={`Cancelar exclusão de ${socio.nome}`}
                          className="rounded text-ink-400 hover:text-ink-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-600"
                        >
                          cancelar
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            setEditando((atual) => ({ ...atual, [socio.id]: String(socio.percentual) }))
                          }
                          aria-label={`Editar percentual de ${socio.nome}`}
                          title={`Editar percentual de ${socio.nome}`}
                          className="rounded text-ink-400 hover:text-ink-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-600"
                        >
                          editar
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmandoId(socio.id)}
                          aria-label={`Apagar sócio ${socio.nome}`}
                          title={`Apagar sócio ${socio.nome}`}
                          className="rounded text-ink-300 hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-600"
                        >
                          apagar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {socios.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-ink-300">
                  Nenhum sócio cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {socios.length > 0 && Math.abs(somaPercentual - 100) > 0.01 && (
        <p className="text-sm text-red-600">
          Os percentuais somam {formatPercent(somaPercentual / 100)}, não 100% — confira os valores.
        </p>
      )}

      <form
        onSubmit={handleCriar}
        className="flex flex-wrap items-end gap-3 rounded-xl border border-ink-200 bg-paper-50 p-4"
      >
        <label className="flex flex-col gap-1 text-xs font-medium text-ink-400">
          Nome
          <input
            type="text"
            value={nomeNovo}
            onChange={(e) => setNomeNovo(e.target.value)}
            className="w-40 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-700"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-ink-400">
          Percentual (%)
          <input
            type="text"
            inputMode="decimal"
            value={percentualNovo}
            onChange={(e) => setPercentualNovo(e.target.value)}
            className="w-28 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-700"
          />
        </label>
        <button
          type="submit"
          disabled={criando}
          className="rounded-lg border border-ink-700 bg-ink-700 px-4 py-2 text-sm font-medium text-paper-100 transition-colors hover:bg-ink-800 disabled:opacity-50"
        >
          {criando ? "Adicionando…" : "Adicionar sócio"}
        </button>
      </form>

      {erro && <p className="text-sm text-red-600">{erro}</p>}
    </div>
  );
}
