import { TODAS_CATEGORIAS } from "@/lib/import/categorizacao";
import type { LinhaImportada } from "@/lib/import/csv";

/**
 * Tabela de conferência compartilhada entre a importação de CSV e de nota
 * fiscal — tudo editável, nada some daqui direto pro banco sem o usuário
 * revisar (e poder corrigir ou remover) cada linha antes de confirmar.
 */
export function TabelaRevisaoLancamentos({
  linhas,
  onAtualizar,
  onRemover,
}: {
  linhas: LinhaImportada[];
  onAtualizar: (chave: string, campo: "data" | "descricao" | "categoria" | "valor", valor: string) => void;
  onRemover: (chave: string) => void;
}) {
  return (
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
                  onChange={(e) => onAtualizar(linha.chave, "data", e.target.value)}
                  className="w-36 rounded-md border border-ink-200 bg-white px-2 py-1 text-xs"
                />
              </td>
              <td className="px-3 py-2">
                <input
                  type="text"
                  value={linha.descricao}
                  onChange={(e) => onAtualizar(linha.chave, "descricao", e.target.value)}
                  className="w-full min-w-[180px] rounded-md border border-ink-200 bg-white px-2 py-1 text-xs"
                />
              </td>
              <td className="px-3 py-2">
                <select
                  value={linha.categoria ?? ""}
                  onChange={(e) => onAtualizar(linha.chave, "categoria", e.target.value)}
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
                  onChange={(e) => onAtualizar(linha.chave, "valor", e.target.value)}
                  className="w-24 rounded-md border border-ink-200 bg-white px-2 py-1 text-right text-xs"
                />
              </td>
              <td className="px-3 py-2 text-right">
                <button
                  type="button"
                  onClick={() => onRemover(linha.chave)}
                  className="text-xs text-ink-300 hover:text-red-600"
                >
                  remover
                </button>
              </td>
            </tr>
          ))}
          {linhas.length === 0 && (
            <tr>
              <td colSpan={5} className="px-3 py-8 text-center text-ink-300">
                Nenhuma linha pronta para conferência ainda.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
