"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { importarLancamentos } from "@/lib/actions/lancamentos";

interface ContaOpcao {
  id: string;
  banco: string;
}

const MOTIVOS = [
  "Validade vencida",
  "Erro de preparo",
  "Quebra",
  "Outro",
] as const;

type Motivo = (typeof MOTIVOS)[number];

function hoje(): string {
  return new Date().toISOString().slice(0, 10);
}

function paraNumero(texto: string): number {
  return Number(texto.replace(",", "."));
}

function descricaoPadrao(motivo: Motivo): string {
  return `Desperdício — ${motivo}`;
}

export function DesperdicioForm({
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
  const [motivo, setMotivo] = useState<Motivo>(MOTIVOS[0]);
  const [descricao, setDescricao] = useState(descricaoPadrao(MOTIVOS[0]));
  const [descricaoEditada, setDescricaoEditada] = useState(false);
  const [valor, setValor] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  function handleMotivo(novoMotivo: Motivo) {
    setMotivo(novoMotivo);
    if (!descricaoEditada) setDescricao(descricaoPadrao(novoMotivo));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const valorNumero = paraNumero(valor);

    if (!contaId || !data || !Number.isFinite(valorNumero) || valorNumero <= 0) {
      setResultado({ tipo: "erro", texto: "Preencha conta, data e um valor maior que zero." });
      return;
    }

    setEnviando(true);
    setResultado(null);

    const resposta = await importarLancamentos(empresaId, contaId, [
      {
        data,
        descricao: descricao.trim() || descricaoPadrao(motivo),
        categoria: "Desperdício",
        valor: -valorNumero,
      },
    ]);

    setEnviando(false);

    if (resposta.sucesso) {
      setResultado({ tipo: "ok", texto: "Desperdício registrado." });
      setValor("");
      setMotivo(MOTIVOS[0]);
      setDescricao(descricaoPadrao(MOTIVOS[0]));
      setDescricaoEditada(false);
      router.refresh();
    } else {
      setResultado({ tipo: "erro", texto: resposta.erro ?? "Não foi possível registrar." });
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-brass-700">Importação</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink-900">Desperdício</h1>
        <p className="mt-1 text-sm text-ink-400">
          Registre insumo/mercadoria perdida (validade vencida, erro de preparo, quebra). Entra como
          despesa normal na conta escolhida — aparece no relatório e no resumo de CMV.
        </p>
      </div>

      {contas.length === 0 ? (
        <p className="rounded-xl border border-ink-200 bg-paper-50 p-6 text-sm text-ink-500">
          Esta empresa ainda não tem nenhuma conta bancária cadastrada. Cadastre uma conta antes de
          registrar um desperdício.
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-xl border border-ink-200 bg-paper-50 p-5"
        >
          <div className="flex flex-wrap gap-4">
            <label className="flex flex-col gap-1 text-xs font-medium text-ink-400">
              Conta
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
              Motivo
              <select
                value={motivo}
                onChange={(e) => handleMotivo(e.target.value as Motivo)}
                className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-700"
              >
                {MOTIVOS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="flex flex-col gap-1 text-xs font-medium text-ink-400">
            Descrição
            <input
              type="text"
              value={descricao}
              onChange={(e) => {
                setDescricao(e.target.value);
                setDescricaoEditada(true);
              }}
              className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-700"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-medium text-ink-400">
            Valor perdido (R$)
            <input
              type="text"
              inputMode="decimal"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="0,00"
              className="w-36 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm text-red-700"
            />
          </label>

          <div>
            <button
              type="submit"
              disabled={enviando}
              className="rounded-xl border border-ink-700 bg-ink-700 px-5 py-2.5 text-sm font-semibold text-paper-100 transition-colors hover:bg-ink-800 disabled:opacity-50"
            >
              {enviando ? "Registrando…" : "Registrar desperdício"}
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
