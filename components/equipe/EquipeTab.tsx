"use client";

import { useState } from "react";
import type { MembroEquipe } from "@/lib/actions/equipe";
import { redefinirSenhaMembro } from "@/lib/actions/equipe";

export function EquipeTab({ membros }: { membros: MembroEquipe[] }) {
  const [redefinindoId, setRedefinindoId] = useState<string | null>(null);
  const [novaSenha, setNovaSenha] = useState("");
  const [salvandoId, setSalvandoId] = useState<string | null>(null);
  const [resultado, setResultado] = useState<{ tipo: "ok" | "erro"; texto: string; userId: string } | null>(
    null,
  );

  function iniciar(userId: string) {
    setRedefinindoId(userId);
    setNovaSenha("");
    setResultado(null);
  }

  function cancelar() {
    setRedefinindoId(null);
    setNovaSenha("");
  }

  async function handleRedefinir(userId: string) {
    setSalvandoId(userId);
    setResultado(null);
    const resposta = await redefinirSenhaMembro(userId, novaSenha);
    setSalvandoId(null);

    if (resposta.sucesso) {
      setResultado({ tipo: "ok", texto: "Senha redefinida — repasse a nova senha pra pessoa.", userId });
      setRedefinindoId(null);
      setNovaSenha("");
    } else {
      setResultado({ tipo: "erro", texto: resposta.erro ?? "Não foi possível redefinir.", userId });
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-ink-400">
        Alguém esqueceu a senha? Redefina aqui e repasse a nova senha pra pessoa (por WhatsApp, por
        exemplo) — não existe recuperação por e-mail nesta versão.
      </p>
      <ul className="flex flex-col gap-2">
        {membros.map((m) => (
          <li key={m.userId} className="rounded-lg border border-ink-200 bg-white p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-sm font-medium text-ink-700">{m.username ?? "(sem usuário)"}</span>
                <span className="ml-2 text-xs uppercase tracking-wide text-ink-400">
                  {m.papel === "dono" ? "Dono" : "Funcionário"}
                </span>
              </div>
              {redefinindoId !== m.userId && (
                <button
                  type="button"
                  onClick={() => iniciar(m.userId)}
                  className="text-xs font-medium text-brass-700 hover:underline"
                >
                  Redefinir senha
                </button>
              )}
            </div>

            {redefinindoId === m.userId && (
              <div className="mt-2 flex flex-wrap items-end gap-2">
                <label className="flex flex-col gap-1 text-xs font-medium text-ink-400">
                  Nova senha
                  <input
                    type="text"
                    autoComplete="new-password"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    placeholder="mínimo 6 caracteres"
                    className="w-48 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-700"
                  />
                </label>
                <button
                  type="button"
                  disabled={salvandoId === m.userId}
                  onClick={() => handleRedefinir(m.userId)}
                  className="rounded-lg border border-ink-700 bg-ink-700 px-3 py-1.5 text-xs font-semibold text-paper-100 transition-colors hover:bg-ink-800 disabled:opacity-50"
                >
                  {salvandoId === m.userId ? "Salvando…" : "Salvar"}
                </button>
                <button type="button" onClick={cancelar} className="text-xs text-ink-400 hover:text-ink-700">
                  cancelar
                </button>
              </div>
            )}

            {resultado?.userId === m.userId && (
              <p className={`mt-2 text-xs ${resultado.tipo === "ok" ? "text-emerald-600" : "text-red-600"}`}>
                {resultado.texto}
              </p>
            )}
          </li>
        ))}
        {membros.length === 0 && (
          <li className="rounded-lg border border-ink-200 bg-white p-4 text-center text-sm text-ink-300">
            Nenhum outro membro da equipe cadastrado.
          </li>
        )}
      </ul>
    </div>
  );
}
