"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { parseNotaFiscalXml, notaParaLinha } from "@/lib/import/nfe";
import { useRevisaoLinhas } from "@/lib/import/useRevisaoLinhas";
import { importarLancamentos } from "@/lib/actions/lancamentos";
import { TabelaRevisaoLancamentos } from "./TabelaRevisaoLancamentos";

interface ContaOpcao {
  id: string;
  banco: string;
}

function lerArquivoComoTexto(arquivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => resolve(String(leitor.result ?? ""));
    leitor.onerror = () => reject(leitor.error);
    leitor.readAsText(arquivo, "utf-8");
  });
}

export function ImportarNotaFiscalForm({
  empresaId,
  empresaCnpj,
  contas,
  voltarHref,
  voltarLabel = "← voltar ao relatório",
}: {
  empresaId: string;
  empresaCnpj: string;
  contas: ContaOpcao[];
  voltarHref: string;
  voltarLabel?: string;
}) {
  const router = useRouter();
  const [contaId, setContaId] = useState(contas[0]?.id ?? "");
  const [processando, setProcessando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const { linhas, setLinhas, atualizarLinha, removerLinha, linhasProntas, linhasPendentes } =
    useRevisaoLinhas();

  async function handleArquivos(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivos = Array.from(e.target.files ?? []);
    if (arquivos.length === 0) return;
    setResultado(null);
    setProcessando(true);

    const novasLinhas = await Promise.all(
      arquivos.map(async (arquivo, indice) => {
        try {
          const conteudo = await lerArquivoComoTexto(arquivo);
          const nota = parseNotaFiscalXml(conteudo);
          const linha = notaParaLinha(nota, `nfe-${Date.now()}-${indice}`, empresaCnpj);
          if (nota.erro) {
            return { ...linha, descricao: `${arquivo.name}: ${nota.erro}` };
          }
          return linha;
        } catch {
          return notaParaLinha(
            { numero: null, dataEmissao: null, emitenteNome: null, emitenteCnpj: null, destinatarioCnpj: null, valorTotal: null, erro: "Falha ao ler o arquivo." },
            `nfe-${Date.now()}-${indice}`,
            empresaCnpj,
          );
        }
      }),
    );

    setLinhas((atual) => [...atual, ...novasLinhas]);
    setProcessando(false);
    e.target.value = "";
  }

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
          Importar nota fiscal (XML)
        </h1>
        <p className="mt-1 text-sm text-ink-400">
          Suba o XML oficial da NF-e (não o PDF do DANFE) — a leitura é direta do arquivo, sem IA.
          Pode selecionar várias notas de uma vez.
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
              Arquivo(s) XML da NF-e
              <input
                type="file"
                accept=".xml,text/xml,application/xml"
                multiple
                onChange={handleArquivos}
                className="text-sm text-ink-700"
              />
            </label>

            {processando && <span className="text-xs text-ink-400">Lendo notas…</span>}
          </div>

          {linhas.length > 0 && (
            <>
              <TabelaRevisaoLancamentos linhas={linhas} onAtualizar={atualizarLinha} onRemover={removerLinha} />

              <div className="flex items-center justify-between">
                <p className="text-xs text-ink-400">
                  {linhasProntas.length} nota(s) prontas para importar
                  {linhasPendentes > 0 && ` · ${linhasPendentes} precisam de correção`}
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
        {voltarLabel}
      </a>
    </div>
  );
}
