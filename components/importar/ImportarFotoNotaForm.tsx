"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { extrairNotaDeFoto, type MediaTypeImagem } from "@/lib/actions/notaFoto";
import { useRevisaoLinhas } from "@/lib/import/useRevisaoLinhas";
import type { LinhaImportada } from "@/lib/import/csv";
import { importarLancamentos } from "@/lib/actions/lancamentos";
import { TabelaRevisaoLancamentos } from "./TabelaRevisaoLancamentos";

interface ContaOpcao {
  id: string;
  banco: string;
}

const MEDIA_TYPES_ACEITOS = ["image/jpeg", "image/png", "image/gif", "image/webp"];

function lerArquivoComoBase64(arquivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => {
      const resultado = String(leitor.result ?? "");
      resolve(resultado.split(",")[1] ?? "");
    };
    leitor.onerror = () => reject(leitor.error);
    leitor.readAsDataURL(arquivo);
  });
}

export function ImportarFotoNotaForm({
  empresaId,
  contas,
  voltarHref,
  voltarLabel = "← voltar ao relatório",
}: {
  empresaId: string;
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

    const novasLinhas: LinhaImportada[] = await Promise.all(
      arquivos.map(async (arquivo, indice) => {
        const chave = `foto-${Date.now()}-${indice}`;
        if (!MEDIA_TYPES_ACEITOS.includes(arquivo.type)) {
          return {
            chave,
            data: "",
            descricao: `${arquivo.name}: formato de imagem não suportado`,
            categoria: null,
            valor: 0,
            comErro: true,
          };
        }

        try {
          const base64 = await lerArquivoComoBase64(arquivo);
          const extracao = await extrairNotaDeFoto(base64, arquivo.type as MediaTypeImagem);

          if (!extracao.sucesso) {
            return {
              chave,
              data: "",
              descricao: `${arquivo.name}: ${extracao.erro}`,
              categoria: null,
              valor: 0,
              comErro: true,
            };
          }

          return {
            chave,
            data: extracao.data ?? "",
            descricao: extracao.descricao ?? arquivo.name,
            categoria: extracao.categoria ?? null,
            valor: extracao.valor ? -Math.abs(extracao.valor) : 0,
            comErro: !extracao.data || !extracao.categoria || !extracao.valor,
          };
        } catch {
          return {
            chave,
            data: "",
            descricao: `${arquivo.name}: falha ao processar a foto`,
            categoria: null,
            valor: 0,
            comErro: true,
          };
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
        <p className="text-xs font-medium uppercase tracking-wide text-brass-700">
          Importação · Leitura automática por IA
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink-900">Foto da nota</h1>
        <p className="mt-1 text-sm text-ink-400">
          Tire uma foto na hora ou envie arquivos já salvos do cupom/nota de uma despesa — uma IA lê
          data, valor, descrição e sugere a categoria. Pela câmera é uma de cada vez; enviando
          arquivo dá pra escolher várias juntas. Sempre confira antes de importar: leitura automática
          erra às vezes.
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
              Tirar foto
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleArquivos}
                className="cursor-pointer text-sm text-ink-700 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-brass-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-paper-100 file:transition-colors hover:file:bg-brass-700"
              />
            </label>

            <label className="flex flex-col gap-1 text-xs font-medium text-ink-400">
              Ou enviar arquivo
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleArquivos}
                className="cursor-pointer text-sm text-ink-700 file:mr-3 file:cursor-pointer file:rounded-lg file:border file:border-ink-200 file:bg-paper-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-ink-700 file:transition-colors hover:file:border-ink-400"
              />
            </label>

            {processando && <span className="text-xs text-ink-400">Lendo nota(s) com IA…</span>}
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
