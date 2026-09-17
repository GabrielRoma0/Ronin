"use client";

import type { LinhaVenda99, ItemCardapioBasico } from "@/lib/import/vendas99";
import { formatBRL } from "@/lib/format";

export function TabelaRevisaoVendas({
  linhas,
  itensCardapio,
  onAtualizar,
  onRemover,
}: {
  linhas: LinhaVenda99[];
  itensCardapio: ItemCardapioBasico[];
  onAtualizar: (chave: string, campo: keyof LinhaVenda99, valor: string | number | null) => void;
  onRemover: (chave: string) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-ink-200">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-ink-200 bg-paper-50 text-left text-xs uppercase tracking-wide text-ink-400">
            <th scope="col" className="px-4 py-2.5 font-medium">Nome no arquivo</th>
            <th scope="col" className="px-4 py-2.5 font-medium">Item do cardápio</th>
            <th scope="col" className="px-4 py-2.5 font-medium">Data</th>
            <th scope="col" className="px-4 py-2.5 font-medium">Quantidade</th>
            <th scope="col" className="px-4 py-2.5 font-medium">Valor total</th>
            <th scope="col" className="px-4 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha) => (
            <tr key={linha.chave} className="border-b border-ink-100 last:border-0">
              <td className="px-4 py-2.5 text-ink-700">{linha.itemNomeOriginal || "—"}</td>
              <td className="px-4 py-2.5">
                <select
                  value={linha.itemId ?? ""}
                  onChange={(e) => onAtualizar(linha.chave, "itemId", e.target.value || null)}
                  className={`rounded-md border bg-white px-2 py-1 text-xs ${
                    linha.itemId ? "border-ink-200" : "border-amber-400"
                  }`}
                >
                  <option value="">Selecione…</option>
                  {itensCardapio.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.nome}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-2.5">
                <input
                  type="date"
                  value={linha.data}
                  onChange={(e) => onAtualizar(linha.chave, "data", e.target.value)}
                  className="rounded-md border border-ink-200 bg-white px-2 py-1 text-xs"
                />
              </td>
              <td className="px-4 py-2.5">
                <input
                  type="text"
                  inputMode="decimal"
                  value={linha.quantidade}
                  onChange={(e) => onAtualizar(linha.chave, "quantidade", Number(e.target.value) || 0)}
                  className="w-16 rounded-md border border-ink-200 bg-white px-2 py-1 text-xs"
                />
              </td>
              <td className="px-4 py-2.5 text-ink-500">{formatBRL(linha.valorTotal)}</td>
              <td className="px-4 py-2.5 text-right">
                <button
                  type="button"
                  onClick={() => onRemover(linha.chave)}
                  aria-label={`Remover linha: ${linha.itemNomeOriginal || "sem nome"}, ${formatBRL(linha.valorTotal)}`}
                  title={`Remover linha: ${linha.itemNomeOriginal || "sem nome"}, ${formatBRL(linha.valorTotal)}`}
                  className="rounded text-xs text-ink-300 hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-600"
                >
                  remover
                </button>
              </td>
            </tr>
          ))}
          {linhas.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-ink-300">
                Nenhuma linha carregada ainda.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
