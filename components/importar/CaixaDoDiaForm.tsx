"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { importarLancamentos } from "@/lib/actions/lancamentos";

interface ContaOpcao {
  id: string;
  banco: string;
}

function hoje(): string {
  return new Date().toISOString().slice(0, 10);
}

export function CaixaDoDiaForm({
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
  const [data, setData] = useState(hoje());
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("Venda em espécie");
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numero = Number(valor.replace(",", "."));
    if (!contaId || !data || !Number.isFinite(numero) || numero <= 0) {
      setResultado({ tipo: "erro", texto: "Preencha conta, data e um valor maior que zero." });
      return;
    }

    setEnviando(true);
    setResultado(null);

    const resposta = await importarLancamentos(empresaId, contaId, [
      { data, descricao: descricao.trim() || "Venda em espécie", categoria: "Vendas", valor: numero },
    ]);

    setEnviando(false);

    if (resposta.sucesso) {
      setResultado({ tipo: "ok", texto: "Lançamento adicionado ao caixa do dia." });
      setValor("");
      router.refresh();
    } else {
      setResultado({ tipo: "erro", texto: resposta.erro ?? "Não foi possível adicionar." });
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-brass-700">Importação</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink-900">Caixa do dia</h1>
        <p className="mt-1 text-sm text-ink-400">
          Para lançar rapidamente o dinheiro em espécie recebido no dia — entra como Receita
          (Vendas). Se for reforço de troco, não é receita, não use esta tela.
        </p>
      </div>

      {contas.length === 0 ? (
        <p className="rounded-xl border border-ink-200 bg-paper-50 p-6 text-sm text-ink-500">
          Esta empresa ainda não tem nenhuma conta bancária cadastrada. Cadastre uma conta antes de
          lançar o caixa do dia.
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

            <label className="flex flex-col gap-1 text-xs font-medium text-ink-400">
              Valor (R$)
              <input
                type="text"
                inputMode="decimal"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0,00"
                className="w-32 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-700"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-xs font-medium text-ink-400">
            Descrição
            <input
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-700"
            />
          </label>

          <div>
            <button
              type="submit"
              disabled={enviando}
              className="rounded-xl border border-ink-700 bg-ink-700 px-5 py-2.5 text-sm font-semibold text-paper-100 transition-colors hover:bg-ink-800 disabled:opacity-50"
            >
              {enviando ? "Adicionando…" : "Adicionar ao caixa do dia"}
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
        ← voltar ao relatório
      </a>
    </div>
  );
}
