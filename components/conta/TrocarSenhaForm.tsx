"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function TrocarSenhaForm() {
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [resultado, setResultado] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResultado(null);

    if (novaSenha.length < 6) {
      setResultado({ tipo: "erro", texto: "A senha precisa ter pelo menos 6 caracteres." });
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setResultado({ tipo: "erro", texto: "As senhas não coincidem." });
      return;
    }

    setSalvando(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    setSalvando(false);

    if (error) {
      setResultado({ tipo: "erro", texto: "Não foi possível trocar a senha." });
    } else {
      setResultado({ tipo: "ok", texto: "Senha atualizada." });
      setNovaSenha("");
      setConfirmarSenha("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm font-medium text-ink-700">
        Nova senha
        <input
          type="password"
          required
          autoComplete="new-password"
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
          className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-brass-600"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-ink-700">
        Confirmar nova senha
        <input
          type="password"
          required
          autoComplete="new-password"
          value={confirmarSenha}
          onChange={(e) => setConfirmarSenha(e.target.value)}
          className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-brass-600"
        />
      </label>

      {resultado && (
        <p className={`text-sm ${resultado.tipo === "ok" ? "text-emerald-600" : "text-red-600"}`}>
          {resultado.texto}
        </p>
      )}

      <button
        type="submit"
        disabled={salvando}
        className="self-start rounded-xl border border-ink-700 bg-ink-700 px-5 py-2.5 text-sm font-semibold text-paper-100 transition-colors hover:bg-ink-800 disabled:opacity-50"
      >
        {salvando ? "Salvando…" : "Trocar senha"}
      </button>
    </form>
  );
}
