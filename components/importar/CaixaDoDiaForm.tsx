"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { importarLancamentos, type LinhaParaImportar } from "@/lib/actions/lancamentos";

interface ContaOpcao {
  id: string;
  banco: string;
}

function hoje(): string {
  return new Date().toISOString().slice(0, 10);
}

function paraNumero(texto: string): number {
  return Number(texto.replace(",", "."));
}

export function CaixaDoDiaForm({
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
  const [data, setData] = useState(hoje());
  const [valorEntrou, setValorEntrou] = useState("");
  const [valorSaiu, setValorSaiu] = useState("");
  const [descricaoSaiu, setDescricaoSaiu] = useState("Saída de caixa (dinheiro em espécie)");
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const entrou = valorEntrou.trim() ? paraNumero(valorEntrou) : 0;
    const saiu = valorSaiu.trim() ? paraNumero(valorSaiu) : 0;

    if (!contaId || !data || (!Number.isFinite(entrou) && !Number.isFinite(saiu))) {
      setResultado({ tipo: "erro", texto: "Preencha conta, data e ao menos um valor." });
      return;
    }
    if (entrou <= 0 && saiu <= 0) {
      setResultado({ tipo: "erro", texto: "Informe quanto entrou e/ou quanto saiu de caixa hoje." });
      return;
    }

    const linhas: LinhaParaImportar[] = [];
    if (entrou > 0) {
      linhas.push({ data, descricao: "Venda em espécie", categoria: "Vendas", valor: entrou });
    }
    if (saiu > 0) {
      linhas.push({
        data,
        descricao: descricaoSaiu.trim() || "Saída de caixa (dinheiro em espécie)",
        categoria: "Outras Despesas",
        valor: -saiu,
      });
    }

    setEnviando(true);
    setResultado(null);

    const resposta = await importarLancamentos(empresaId, contaId, linhas);

    setEnviando(false);

    if (resposta.sucesso) {
      setResultado({ tipo: "ok", texto: "Fechamento de caixa registrado." });
      setValorEntrou("");
      setValorSaiu("");
      router.refresh();
    } else {
      setResultado({ tipo: "erro", texto: resposta.erro ?? "Não foi possível registrar." });
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-brass-700">Importação</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink-900">
          Fechamento de caixa do dia
        </h1>
        <p className="mt-1 text-sm text-ink-400">
          Quanto de dinheiro físico entrou (Receita, categoria Vendas) e quanto saiu (Despesa,
          categoria Outras Despesas) hoje. Se for reforço de troco, não é receita nem despesa, não
          use esta tela.
        </p>
      </div>

      {contas.length === 0 ? (
        <p className="rounded-xl border border-ink-200 bg-paper-50 p-6 text-sm text-ink-500">
          Esta empresa ainda não tem nenhuma conta bancária cadastrada. Cadastre uma conta antes de
          fechar o caixa do dia.
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-xl border border-ink-200 bg-paper-50 p-5"
        >
          <div className="flex flex-wrap gap-4">
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
              Data
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-700"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex flex-col gap-1 text-xs font-medium text-ink-400">
              Entrou (R$)
              <input
                type="text"
                inputMode="decimal"
                value={valorEntrou}
                onChange={(e) => setValorEntrou(e.target.value)}
                placeholder="0,00"
                className="w-36 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm text-emerald-700"
              />
            </label>

            <label className="flex flex-col gap-1 text-xs font-medium text-ink-400">
              Saiu (R$)
              <input
                type="text"
                inputMode="decimal"
                value={valorSaiu}
                onChange={(e) => setValorSaiu(e.target.value)}
                placeholder="0,00"
                className="w-36 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm text-red-700"
              />
            </label>
          </div>

          {paraNumero(valorSaiu || "0") > 0 && (
            <label className="flex flex-col gap-1 text-xs font-medium text-ink-400">
              Descrição da saída
              <input
                type="text"
                value={descricaoSaiu}
                onChange={(e) => setDescricaoSaiu(e.target.value)}
                className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-700"
              />
            </label>
          )}

          <div>
            <button
              type="submit"
              disabled={enviando}
              className="rounded-xl border border-ink-700 bg-ink-700 px-5 py-2.5 text-sm font-semibold text-paper-100 transition-colors hover:bg-ink-800 disabled:opacity-50"
            >
              {enviando ? "Registrando…" : "Registrar fechamento do dia"}
            </button>
          </div>

          {resultado && (
            <p className={`text-sm ${resultado.tipo === "ok" ? "text-emerald-600" : "text-red-600"}`}>
              {resultado.texto}
            </p>
          )}
        </form>
      )}

      <a href={voltarHref} className="text-sm text-ink-400 underline-offset-2 hover:text-ink-700 hover:underline">
        {voltarLabel}
      </a>
    </div>
  );
}
