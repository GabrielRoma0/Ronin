"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessao } from "@/lib/session";

export default function LoginPage() {
  const { sessao, pronto, entrarComoAdmin, entrarComoCliente } = useSessao();
  const router = useRouter();

  useEffect(() => {
    if (!pronto || !sessao) return;
    router.replace(sessao.role === "admin" ? "/admin" : "/cliente");
  }, [pronto, sessao, router]);

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="grid w-full max-w-4xl gap-12 md:grid-cols-2 md:items-center">
        <div className="animate-fade-up">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-700">
            Controle financeiro multi-cliente
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-ink-900 sm:text-5xl">
            O fechamento do mês,
            <br />
            sem <span className="katana-mark">planilha</span> e sem WhatsApp perdido.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-ink-500">
            A Ronin acompanha o P&amp;L de cada empresa contratante em um único lugar —
            substituindo a rotina manual de Excel e mensagens soltas por um relatório
            vivo, com as mesmas 5 abas de sempre.
          </p>
        </div>

        <div className="animate-fade-up rounded-2xl border border-ink-200 bg-paper-50 p-8 shadow-[0_1px_0_0_rgba(16,21,31,0.04)]">
          <h2 className="font-display text-lg font-semibold text-ink-900">Entrar na demonstração</h2>
          <p className="mt-1 text-sm text-ink-400">
            Escolha um dos dois perfis para explorar a plataforma.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={entrarComoAdmin}
              className="group flex items-center justify-between rounded-xl border border-ink-700 bg-ink-700 px-5 py-4 text-left transition-colors hover:bg-ink-800"
            >
              <span>
                <span className="block text-sm font-semibold text-paper-100">
                  Entrar como Ronin (Admin)
                </span>
                <span className="block text-xs text-ink-200">
                  Vê a carteira de empresas clientes
                </span>
              </span>
              <span className="text-paper-100 transition-transform group-hover:translate-x-0.5">→</span>
            </button>

            <button
              type="button"
              onClick={entrarComoCliente}
              className="group flex items-center justify-between rounded-xl border border-ink-200 bg-paper-100 px-5 py-4 text-left transition-colors hover:border-brass-600 hover:bg-brass-100/40"
            >
              <span>
                <span className="block text-sm font-semibold text-ink-900">
                  Entrar como Santo Galo Marmitas (Cliente)
                </span>
                <span className="block text-xs text-ink-400">
                  Vê somente os próprios dados financeiros
                </span>
              </span>
              <span className="text-ink-500 transition-transform group-hover:translate-x-0.5">→</span>
            </button>
          </div>

          <p className="mt-6 text-xs text-ink-300">
            Login fictício — não há autenticação real nesta demonstração.
          </p>
        </div>
      </div>
    </main>
  );
}
