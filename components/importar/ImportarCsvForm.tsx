"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { parseCsvLancamentos, type LinhaImportada } from "@/lib/import/csv";
import { TODAS_CATEGORIAS } from "@/lib/import/categorizacao";
import { importarLancamentos } from "@/lib/actions/lancamentos";
import type { Categoria } from "@/data/categorias";

interface ContaOpcao {
  id: string;
  banco: string;
}

export function ImportarCsvForm({
  empresaId,
  contas,
  voltarHref,
}: {
  empresaId: string;
  contas: ContaOpcao[];
  voltarHref: string;
}) {
  const router = useRouter();
  const [contaId, setContaId] = useState(contas[0]?.id ?? "");
  const [linhas, setLinhas] = useState<LinhaImportada[]>([]);
  const [nomeArquivo, setNomeArquivo] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  function handleArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    setResultado(null);
    setNomeArquivo(arquivo.name);

    const leitor = new FileReader();
    leitor.onload = () => {
      const conteudo = String(leitor.result ?? "");
      setLinhas(parseCsvLancamentos(conteudo));
    };
    leitor.readAsText(arquivo, "utf-8");
  }

  function atualizarLinha(
    chave: string,
    campo: "data" | "descricao" | "categoria" | "valor",
    valor: string,
  ) {
    setLinhas((atual) =>
      atual.map((linha) => {
        if (linha.chave !== chave) return linha;
        switch (campo) {
          case "valor": {
            const numero = Number(valor.replace(",", "."));
            return { ...linha, valor: Number.isFinite(numero) ? numero : linha.valor };
          }
          case "categoria":
            return { ...linha, categoria: (valor as Categoria) || null };
          case "data":
            return { ...linha, data: valor };
          case "descricao":
            return { ...linha, descricao: valor };
        }
      }),
    );
  }

  function removerLinha(chave: string) {
    setLinhas((atual) => atual.filter((linha) => linha.chave !== chave));
  }

  const linhasProntas = linhas.filter((l) => !l.comErro && l.categoria && l.data);
  const linhasPendentes = linhas.length - linhasProntas.length;

  async function handleConfirmar() {
    if (!contaId || linhasProntas.length === 0) return;
    setEnviando(true);
    setResultado(null);

    const resposta = await importarLancamentos(
      empresaId,
      contaId,
      linhasProntas.map((l) => ({
        data: l.data,
        descricao: l.descricao,
        categoria: l.categoria!,
        valor: l.valor,
      })),
    );

    setEnviando(false);

    if (resposta.sucesso) {
      setResultado({ tipo: "ok", texto: `${resposta.quantidade} lançamento(s) importado(s).` });
      setLinhas([]);
      setNomeArquivo(null);
      router.refresh();
    } else {
      setResultado({ tipo: "erro", texto: resposta.erro ?? "Não foi possível importar." });
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-brass-700">Importação</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink-900">
          Importar lançamentos por CSV
        </h1>
        <p className="mt-1 text-sm text-ink-400">
          Confira e corrija cada linha antes de importar — nada é gravado sem essa confirmação.
        </p>
      </div>

      {contas.length === 0 ? (
        <p className="rounded-xl border border-ink-200 bg-paper-50 p-6 text-sm text-ink-500">
          Esta empresa ainda não tem nenhuma conta bancária cadastrada. Cadastre uma conta antes de
          importar lançamentos.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-end gap-4 rounded-xl border border-ink-200 bg-paper-50 p-4">
            <label className="flex flex-col gap-1 text-xs font-medium text-ink-400">
              Conta de destino
              <select
                value={contaId}
                onChange={(e) => setContaId(e.target.value)}
                className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-700"
              >
                {contas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.banco}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-xs font-medium text-ink-400">
              Arquivo CSV
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleArquivo}
                className="text-sm text-ink-700"
              />
            </label>

            {nomeArquivo && <span className="text-xs text-ink-400">{nomeArquivo}</span>}
          </div>

          {linhas.length > 0 && (
            <>
              <div className="overflow-x-auto rounded-xl border border-ink-200">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="border-b border-ink-200 bg-paper-50 text-left text-xs uppercase tracking-wide text-ink-400">
                      <th className="px-3 py-2.5 font-medium">Data</th>
                      <th className="px-3 py-2.5 font-medium">Descrição</th>
                      <th className="px-3 py-2.5 font-medium">Categoria</th>
                      <th className="px-3 py-2.5 text-right font-medium">Valor</th>
                      <th className="px-3 py-2.5" />
                    </tr>
                  </thead>
                  <tbody>
                    {linhas.map((linha) => (
                      <tr
                        key={linha.chave}
                        className={`border-b border-ink-100 last:border-0 ${linha.comErro ? "bg-red-50/60" : ""}`}
                      >
                        <td className="px-3 py-2">
                          <input
                            type="date"
                            value={linha.data}
                            onChange={(e) => atualizarLinha(linha.chave, "data", e.target.value)}
                            className="w-36 rounded-md border border-ink-200 bg-white px-2 py-1 text-xs"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={linha.descricao}
                            onChange={(e) => atualizarLinha(linha.chave, "descricao", e.target.value)}
                            className="w-full min-w-[180px] rounded-md border border-ink-200 bg-white px-2 py-1 text-xs"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={linha.categoria ?? ""}
                            onChange={(e) => atualizarLinha(linha.chave, "categoria", e.target.value)}
                            className="w-56 rounded-md border border-ink-200 bg-white px-2 py-1 text-xs"
                          >
                            <option value="" disabled>
                              Selecione…
                            </option>
                            {TODAS_CATEGORIAS.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <input
                            type="text"
                            value={linha.valor}
                            onChange={(e) => atualizarLinha(linha.chave, "valor", e.target.value)}
                            className="w-24 rounded-md border border-ink-200 bg-white px-2 py-1 text-right text-xs"
                          />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => removerLinha(linha.chave)}
                            className="text-xs text-ink-300 hover:text-red-600"
                          >
                            remover
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-ink-400">
                  {linhasProntas.length} linha(s) prontas para importar
                  {linhasPendentes > 0 && ` · ${linhasPendentes} precisam de correção (data ou categoria)`}
                </p>
                <button
                  type="button"
                  onClick={handleConfirmar}
                  disabled={enviando || linhasProntas.length === 0}
                  className="rounded-xl border border-ink-700 bg-ink-700 px-5 py-2.5 text-sm font-semibold text-paper-100 transition-colors hover:bg-ink-800 disabled:opacity-50"
                >
                  {enviando ? "Importando…" : `Confirmar e importar ${linhasProntas.length} lançamento(s)`}
                </button>
              </div>
            </>
          )}

          {resultado && (
            <p className={`text-sm ${resultado.tipo === "ok" ? "text-emerald-600" : "text-red-600"}`}>
              {resultado.texto}
            </p>
          )}
        </>
      )}

      <a href={voltarHref} className="text-sm text-ink-400 underline-offset-2 hover:text-ink-700 hover:underline">
        ← voltar ao relatório
      </a>
    </div>
  );
}
