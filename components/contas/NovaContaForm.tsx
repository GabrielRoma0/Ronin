"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { criarConta } from "@/lib/actions/contas";

export function NovaContaForm({ empresaId }: { empresaId: string }) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [banco, setBanco] = useState("");
  const [titular, setTitular] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [saldoAtual, setSaldoAtual] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);

    const saldo = saldoAtual.trim() ? Number(saldoAtual.replace(",", ".")) : null;
    const resposta = await criarConta(empresaId, banco, titular, cnpj, saldo);

    setSalvando(false);
    if (resposta.sucesso) {
      setBanco("");
      setTitular("");
      setCnpj("");
      setSaldoAtual("");
      setAberto(false);
      router.refresh();
    } else {
      setErro(resposta.erro ?? "Não foi possível cadastrar a conta.");
    }
  }

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="text-sm text-ink-400 underline-offset-2 hover:text-ink-700 hover:underline"
      >
        + Cadastrar conta bancária
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-3 rounded-xl border border-ink-200 bg-paper-50 p-4"
    >
      <label className="flex flex-col gap-1 text-xs font-medium text-ink-400">
        Banco
        <input
          type="text"
          required
          value={banco}
          onChange={(e) => setBanco(e.target.value)}
          placeholder="ex.: Itaú"
          className="w-32 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-700"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-ink-400">
        Titular
        <input
          type="text"
          required
          value={titular}
          onChange={(e) => setTitular(e.target.value)}
          className="w-48 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-700"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-ink-400">
        CNPJ
        <input
          type="text"
          required
          value={cnpj}
          onChange={(e) => setCnpj(e.target.value)}
          placeholder="00.000.000/0001-00"
          className="w-40 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-700"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-ink-400">
        Saldo atual (R$)
        <input
          type="text"
          inputMode="decimal"
          value={saldoAtual}
          onChange={(e) => setSaldoAtual(e.target.value)}
          placeholder="opcional"
          className="w-32 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-700"
        />
      </label>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={salvando}
          className="rounded-lg border border-ink-700 bg-ink-700 px-4 py-2 text-sm font-medium text-paper-100 transition-colors hover:bg-ink-800 disabled:opacity-50"
        >
          {salvando ? "Salvando…" : "Cadastrar"}
        </button>
        <button
          type="button"
          onClick={() => setAberto(false)}
          className="rounded-lg border border-ink-200 px-4 py-2 text-sm text-ink-500 hover:border-ink-400"
        >
          Cancelar
        </button>
      </div>

      {erro && <p className="w-full text-sm text-red-600">{erro}</p>}
    </form>
  );
}
