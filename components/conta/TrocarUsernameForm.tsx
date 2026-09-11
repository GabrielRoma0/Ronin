"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { atualizarUsername } from "@/lib/actions/conta";

export function TrocarUsernameForm({ usernameAtual }: { usernameAtual: string }) {
  const router = useRouter();
  const [username, setUsername] = useState(usernameAtual);
  const [salvando, setSalvando] = useState(false);
  const [resultado, setResultado] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setResultado(null);

    const resposta = await atualizarUsername(username);

    setSalvando(false);
    if (resposta.sucesso) {
      setResultado({ tipo: "ok", texto: "Usuário atualizado." });
      router.refresh();
    } else {
      setResultado({ tipo: "erro", texto: resposta.erro ?? "Não foi possível atualizar." });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm font-medium text-ink-700">
        Usuário
        <input
          type="text"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-brass-600"
        />
      </label>
      <p className="text-xs text-ink-400">
        3 a 32 caracteres: letras minúsculas, números, ponto, hífen ou underline.
      </p>

      {resultado && (
        <p className={`text-sm ${resultado.tipo === "ok" ? "text-emerald-600" : "text-red-600"}`}>
          {resultado.texto}
        </p>
      )}

      <button
        type="submit"
        disabled={salvando || username.trim().toLowerCase() === usernameAtual}
        className="self-start rounded-xl border border-ink-700 bg-ink-700 px-5 py-2.5 text-sm font-semibold text-paper-100 transition-colors hover:bg-ink-800 disabled:opacity-50"
      >
        {salvando ? "Salvando…" : "Salvar usuário"}
      </button>
    </form>
  );
}
