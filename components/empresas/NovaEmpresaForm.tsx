"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { criarEmpresa } from "@/lib/actions/empresas";

export function NovaEmpresaForm() {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [nome, setNome] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);

    const resposta = await criarEmpresa(nome, cnpj);

    setSalvando(false);
    if (resposta.sucesso && resposta.empresaId) {
      router.push(`/admin/empresas/${resposta.empresaId}`);
    } else {
      setErro(resposta.erro ?? "Não foi possível cadastrar a empresa.");
    }
  }

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="rounded-xl border border-ink-700 bg-ink-700 px-4 py-2.5 text-sm font-medium text-paper-100 transition-colors hover:bg-ink-800"
      >
        + Nova empresa
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-3 rounded-xl border border-ink-200 bg-paper-50 p-4"
    >
      <label className="flex flex-col gap-1 text-xs font-medium text-ink-400">
        Nome da empresa
        <input
          type="text"
          required
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-56 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-700"
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
          className="w-44 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-700"
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
