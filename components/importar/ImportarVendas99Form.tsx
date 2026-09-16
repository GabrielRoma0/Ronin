"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { parseCsvVendas99, type ItemCardapioBasico, type LinhaVenda99 } from "@/lib/import/vendas99";
import { importarVendasItem } from "@/lib/actions/vendasItem";
import { TabelaRevisaoVendas } from "./TabelaRevisaoVendas";

function hoje(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ImportarVendas99Form({
  empresaId,
  itensCardapio,
  voltarHref,
  voltarLabel = "← voltar ao relatório",
}: {
  empresaId: string;
  itensCardapio: ItemCardapioBasico[];
  voltarHref: string;
  voltarLabel?: string;
}) {
  const router = useRouter();
  const [dataPadrao, setDataPadrao] = useState(hoje());
  const [nomeArquivo, setNomeArquivo] = useState<string | null>(null);
  const [linhas, setLinhas] = useState<LinhaVenda99[]>([]);
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
      setLinhas(parseCsvVendas99(conteudo, itensCardapio, dataPadrao));
    };
    leitor.readAsText(arquivo, "utf-8");
  }

  function atualizarLinha(chave: string, campo: keyof LinhaVenda99, valor: string | number | null) {
    setLinhas((atual) =>
      atual.map((l) => (l.chave === chave ? { ...l, [campo]: valor } : l)),
    );
  }

  function removerLinha(chave: string) {
    setLinhas((atual) => atual.filter((l) => l.chave !== chave));
  }

  const linhasProntas = linhas.filter((l) => l.itemId && l.data && l.quantidade > 0);
  const linhasPendentes = linhas.length - linhasProntas.length;

  async function handleConfirmar() {
    if (linhasProntas.length === 0) return;
    setEnviando(true);
    setResultado(null);

    const resposta = await importarVendasItem(
      empresaId,
      linhasProntas.map((l) => ({
        itemId: l.itemId!,
        data: l.data,
        quantidade: l.quantidade,
        valorTotal: l.valorTotal,
      })),
    );

    setEnviando(false);
    if (resposta.sucesso) {
      setResultado({ tipo: "ok", texto: `${resposta.quantidade} venda(s) importada(s).` });
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
        <p className="text-xs font-medium uppercase tracking-wide text-brass-700">
          Importação · Vendas por item
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink-900">Vendas 99Food (CSV)</h1>
        <p className="mt-1 text-sm text-ink-400">
          Sobe o relatório exportado do Portal do Parceiro 99Food (Exportar relatório) pra registrar
          quantas unidades de cada item venderam — cruza com a ficha técnica em{" "}
          <strong>Custo de Mercadoria</strong> pra calcular o CMV real do período. O formato de coluna
          varia por exportação, então confira o nome de cada item antes de confirmar: o sistema tenta
          casar automaticamente com os itens já cadastrados, mas nem sempre acerta o nome exato.
        </p>
      </div>

      {itensCardapio.length === 0 ? (
        <p className="rounded-xl border border-ink-200 bg-paper-50 p-6 text-sm text-ink-500">
          Cadastre pelo menos um item em <strong>Custo de Mercadoria</strong> antes de importar
          vendas — é contra esses itens que cada linha do arquivo é casada.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-end gap-4 rounded-xl border border-ink-200 bg-paper-50 p-4">
            <label className="flex flex-col gap-1 text-xs font-medium text-ink-400">
              Data padrão (usada quando o arquivo não tem coluna de data)
              <input
                type="date"
                value={dataPadrao}
                onChange={(e) => setDataPadrao(e.target.value)}
                className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-700"
              />
            </label>

            <label className="flex flex-col gap-1 text-xs font-medium text-ink-400">
              Arquivo CSV
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleArquivo}
                className="cursor-pointer text-sm text-ink-700 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-brass-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-paper-100 file:transition-colors hover:file:bg-brass-700"
              />
            </label>

            {nomeArquivo && <span className="text-xs text-ink-400">{nomeArquivo}</span>}
          </div>

          {linhas.length > 0 && (
            <>
              <TabelaRevisaoVendas
                linhas={linhas}
                itensCardapio={itensCardapio}
                onAtualizar={atualizarLinha}
                onRemover={removerLinha}
              />

              <div className="flex items-center justify-between">
                <p className="text-xs text-ink-400">
                  {linhasProntas.length} linha(s) prontas para importar
                  {linhasPendentes > 0 && ` · ${linhasPendentes} precisam de correção (item ou data)`}
                </p>
                <button
                  type="button"
                  onClick={handleConfirmar}
                  disabled={enviando || linhasProntas.length === 0}
                  className="rounded-xl border border-ink-700 bg-ink-700 px-5 py-2.5 text-sm font-semibold text-paper-100 transition-colors hover:bg-ink-800 disabled:opacity-50"
                >
                  {enviando ? "Importando…" : `Confirmar e importar ${linhasProntas.length} venda(s)`}
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
