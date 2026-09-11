"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { entrarComUsername } from "@/lib/actions/auth";

export function LoginForm() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    const resposta = await entrarComUsername(usuario, senha);

    if (!resposta.sucesso) {
      setCarregando(false);
      setErro(resposta.erro ?? "Usuário ou senha inválidos.");
      return;
    }

    // refresh() força os Server Components a reler a sessão (cookie novo)
    // antes do redirect que app/page.tsx faz de acordo com o papel do usuário.
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm font-medium text-ink-700">
        Usuário
        <input
          type="text"
          required
          autoComplete="username"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-brass-600"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-ink-700">
        Senha
        <input
          type="password"
          required
          autoComplete="current-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-brass-600"
        />
      </label>

      {erro && <p className="text-sm text-red-600">{erro}</p>}

      <button
        type="submit"
        disabled={carregando}
        className="mt-2 rounded-xl border border-ink-700 bg-ink-700 px-5 py-3 text-sm font-semibold text-paper-100 transition-colors hover:bg-ink-800 disabled:opacity-60"
      >
        {carregando ? "Entrando…" : "Entrar"}
      </button>

      <p className="mt-1 text-xs text-ink-300">Acesso por convite — fale com um dos sócios para receber suas credenciais.</p>
    </form>
  );
}
