"use client";

import { useState } from "react";
import type { Periodo } from "@/data/seed";
import { formatBRL, nomeMes } from "@/lib/format";

export function WhatsAppSimButton({
  empresaNome,
  periodo,
}: {
  empresaNome: string;
  periodo: Periodo;
}) {
  const [aberto, setAberto] = useState(false);

  const despesaTopo = [...periodo.despesas].sort(
    (a, b) => Math.abs(b.valor) - Math.abs(a.valor),
  )[0];

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="katana-mark flex w-full items-center justify-center gap-2 rounded-xl border border-ink-700 bg-ink-700 px-4 py-2.5 text-sm font-medium text-paper-100 transition-colors hover:bg-ink-800 sm:w-auto"
      >
        <span aria-hidden>💬</span> Simular envio por WhatsApp
      </button>

      {aberto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-900/50 p-4"
          onClick={() => setAberto(false)}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-sm flex-col overflow-hidden rounded-[2rem] border-8 border-ink-900 bg-[#e5ddd5] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 bg-[#075E54] px-4 py-3 text-white">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-sm font-semibold">
                R
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold leading-tight">Ronin</p>
                <p className="text-[11px] text-white/70">online</p>
              </div>
              <button
                type="button"
                onClick={() => setAberto(false)}
                aria-label="Fechar simulação"
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4" style={{ minHeight: 320 }}>
              <div className="mx-auto w-fit rounded-md bg-[#fff4c2] px-3 py-1 text-[11px] text-ink-600">
                Simulação — nenhuma mensagem real foi enviada
              </div>

              <div className="ml-auto max-w-[85%] rounded-lg rounded-tr-sm bg-[#DCF8C6] px-3 py-2 text-sm text-ink-800 shadow-sm">
                <p className="whitespace-pre-line leading-snug">
                  {`📊 Fechamento de ${nomeMes(periodo.mes)}/${periodo.ano} — ${empresaNome}\n\n` +
                    `Receitas: ${formatBRL(periodo.indicadores.totalReceitas)}\n` +
                    `Despesas: ${formatBRL(periodo.indicadores.totalDespesas)}\n` +
                    `Resultado Final: ${formatBRL(periodo.indicadores.resultadoFinal)} ${
                      periodo.indicadores.resultadoFinal < 0 ? "🔴" : "🟢"
                    }\n\n` +
                    (despesaTopo
                      ? `Maior despesa do mês: ${despesaTopo.categoria} (${Math.round(
                          (despesaTopo.percentualDespesas ?? 0) * 1000,
                        ) / 10}%)\n\n`
                      : "") +
                    `_Mensagem de demonstração gerada automaticamente pela plataforma._`}
                </p>
                <span className="mt-1 flex items-center justify-end gap-1 text-[10px] text-ink-500/70">
                  09:14 <span className="text-sky-500">✓✓</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
