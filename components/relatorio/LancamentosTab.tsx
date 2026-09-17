"use client";

import { useMemo, useState } from "react";
import { grupoDaCategoria, type Categoria } from "@/data/categorias";
import { Valor } from "@/components/ui/Valor";
import { formatDataCurta } from "@/lib/format";
import { carregarMaisLancamentos } from "@/lib/actions/lancamentos";
import type { CursorLancamentos } from "@/lib/data/relatorio";

/** Só os campos que esta tabela realmente usa — não exige o `conta` de `Lancamento`. */
export interface LancamentoTabela {
  id: string;
  data: string;
  descricao: string;
  categoria: Categoria;
  valor: number;
}

const ROTULO_GRUPO: Record<string, string> = {
  receita: "Receita",
  despesa: "Despesa",
  outro: "Outro movimento",
};

const ESTILO_GRUPO: Record<string, string> = {
  receita: "bg-emerald-50 text-emerald-700 border-emerald-200",
  despesa: "bg-red-50 text-red-700 border-red-200",
  outro: "bg-brass-100 text-brass-700 border-brass-300",
};

const TAMANHOS_PAGINA = [25, 50, 100] as const;

export function LancamentosTab({
  empresaId,
  contaId,
  conta,
  lancamentosIniciais,
  cursorInicial,
}: {
  empresaId: string;
  contaId: string;
  conta: string;
  /** Só a página mais recente — o resto vem sob demanda via "carregar mais". */
  lancamentosIniciais: LancamentoTabela[];
  cursorInicial: CursorLancamentos | null;
}) {
  const [lancamentos, setLancamentos] = useState(lancamentosIniciais);
  const [cursor, setCursor] = useState(cursorInicial);
  const [tamanhoPagina, setTamanhoPagina] = useState<number>(50);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [categoria, setCategoria] = useState("todas");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const categorias = useMemo(
    () => Array.from(new Set(lancamentos.map((l) => l.categoria))).sort(),
    [lancamentos],
  );

  const filtrados = useMemo(() => {
    return lancamentos.filter((l) => {
      if (categoria !== "todas" && l.categoria !== categoria) return false;
      if (dataInicio && l.data < dataInicio) return false;
      if (dataFim && l.data > dataFim) return false;
      return true;
    });
  }, [lancamentos, categoria, dataInicio, dataFim]);

  const totalFiltrado = filtrados.reduce((acc, l) => acc + l.valor, 0);

  async function handleCarregarMais() {
    if (!cursor) return;
    setCarregando(true);
    setErro(null);
    const resposta = await carregarMaisLancamentos(empresaId, contaId, cursor, tamanhoPagina);
    setCarregando(false);

    if (resposta.sucesso) {
      setLancamentos((atual) => [...atual, ...(resposta.itens ?? [])]);
      setCursor(resposta.proximoCursor ?? null);
    } else {
      setErro(resposta.erro ?? "Não foi possível carregar mais lançamentos.");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-brass-700">
          Conta {conta}
        </p>
        <h2 className="mt-1 font-display text-2xl font-semibold text-ink-900">Lançamentos</h2>
      </div>

      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-ink-200 bg-paper-50 p-4">
        <label className="flex flex-col gap-1 text-xs font-medium text-ink-400">
          Categoria
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-700"
          >
            <option value="todas">Todas</option>
            {categorias.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-ink-400">
          De
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-700"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-ink-400">
          Até
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-700"
          />
        </label>

        {(categoria !== "todas" || dataInicio || dataFim) && (
          <button
            type="button"
            onClick={() => {
              setCategoria("todas");
              setDataInicio("");
              setDataFim("");
            }}
            className="rounded text-sm text-ink-400 underline-offset-2 hover:text-ink-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-600"
          >
            Limpar filtros
          </button>
        )}

        <span className="ml-auto text-xs text-ink-400">
          {filtrados.length} lançamento{filtrados.length === 1 ? "" : "s"} carregado
          {filtrados.length === 1 ? "" : "s"}
          {(categoria !== "todas" || dataInicio || dataFim) &&
            " (filtro só considera o que já foi carregado)"}
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-ink-200">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-ink-200 bg-paper-50 text-left text-xs uppercase tracking-wide text-ink-400">
              <th scope="col" className="px-4 py-2.5 font-medium">Data</th>
              <th scope="col" className="px-4 py-2.5 font-medium">Descrição</th>
              <th scope="col" className="px-4 py-2.5 font-medium">Categoria</th>
              <th scope="col" className="px-4 py-2.5 font-medium">Grupo</th>
              <th scope="col" className="px-4 py-2.5 text-right font-medium">Valor</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((l) => {
              const grupo = grupoDaCategoria(l.categoria);
              return (
                <tr key={l.id} className="border-b border-ink-100 last:border-0">
                  <td className="px-4 py-2.5 text-ink-500">{formatDataCurta(l.data)}</td>
                  <td className="px-4 py-2.5 text-ink-700">{l.descricao}</td>
                  <td className="px-4 py-2.5 text-ink-500">{l.categoria}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs font-medium ${ESTILO_GRUPO[grupo]}`}
                    >
                      {ROTULO_GRUPO[grupo]}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Valor valor={l.valor} />
                  </td>
                </tr>
              );
            })}
            {filtrados.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink-300">
                  Nenhum lançamento encontrado para esses filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {cursor && (
            <button
              type="button"
              disabled={carregando}
              onClick={handleCarregarMais}
              className="rounded-lg border border-ink-200 bg-paper-50 px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:border-ink-400 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-600"
            >
              {carregando ? "Carregando…" : "Carregar mais lançamentos"}
            </button>
          )}
          {!cursor && lancamentos.length > 0 && (
            <span className="text-xs text-ink-300">Todos os lançamentos desta conta já foram carregados.</span>
          )}
          {cursor && (
            <label className="flex items-center gap-2 text-xs font-medium text-ink-400">
              Por vez
              <select
                value={tamanhoPagina}
                onChange={(e) => setTamanhoPagina(Number(e.target.value))}
                disabled={carregando}
                className="rounded-lg border border-ink-200 bg-white px-2 py-1 text-sm text-ink-700"
              >
                {TAMANHOS_PAGINA.map((tamanho) => (
                  <option key={tamanho} value={tamanho}>
                    {tamanho}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
        <div className="flex justify-end text-sm">
          <span className="text-ink-400">Total filtrado:&nbsp;</span>
          <Valor valor={totalFiltrado} />
        </div>
      </div>

      {erro && (
        <p className="text-sm text-red-600">
          {erro}{" "}
          <button
            type="button"
            onClick={handleCarregarMais}
            className="rounded font-medium underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-600"
          >
            Tentar novamente
          </button>
        </p>
      )}
    </div>
  );
}
