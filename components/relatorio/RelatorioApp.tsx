"use client";

import { useState } from "react";
import type { Empresa } from "@/data/seed";
import { getLancamentos, getPeriodo } from "@/data/seed";
import { ResumoTab } from "./ResumoTab";
import { LancamentosTab } from "./LancamentosTab";
import { AIReportCard } from "./AIReportCard";
import { WhatsAppSimButton } from "./WhatsAppSimButton";

type AbaId =
  | "consolidado"
  | "itau-resumo"
  | "itau-lancamentos"
  | "santander-resumo"
  | "santander-lancamentos";

const ABAS: { id: AbaId; label: string }[] = [
  { id: "consolidado", label: "Resumo Consolidado" },
  { id: "itau-resumo", label: "Resumo Itaú" },
  { id: "itau-lancamentos", label: "Lançamentos Itaú" },
  { id: "santander-resumo", label: "Resumo Santander" },
  { id: "santander-lancamentos", label: "Lançamentos Santander" },
];

/**
 * Componente único usado tanto pela Visão Cliente quanto pelo detalhe da
 * Visão Admin. O `empresa` sempre chega explícito via props — este
 * componente nunca busca dados por conta própria a partir de estado global.
 */
export function RelatorioApp({ empresa }: { empresa: Empresa; viewer: "admin" | "cliente" }) {
  const [aba, setAba] = useState<AbaId>("consolidado");

  const consolidado = getPeriodo(empresa.id);
  const itau = getPeriodo(empresa.id, "Itaú");
  const santander = getPeriodo(empresa.id, "Santander");
  const lancamentosItau = getLancamentos(empresa.id, "Itaú");
  const lancamentosSantander = getLancamentos(empresa.id, "Santander");

  if (!consolidado || !itau || !santander) {
    return <p className="p-8 text-ink-400">Não há dados para esta empresa.</p>;
  }

  const contaItau = empresa.contas.find((c) => c.banco === "Itaú");
  const contaSantander = empresa.contas.find((c) => c.banco === "Santander");

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-400">
            {empresa.cnpj}
          </p>
          <h1 className="font-display text-3xl font-semibold text-ink-900">{empresa.nome}</h1>
          <p className="mt-1 text-sm text-ink-400">
            Itaú · {contaItau?.titular} &nbsp;·&nbsp; Santander · {contaSantander?.titular}
          </p>
        </div>
        <WhatsAppSimButton empresaNome={empresa.nome} periodo={consolidado} />
      </div>

      <nav className="flex gap-1 overflow-x-auto border-b border-ink-200">
        {ABAS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setAba(item.id)}
            className={`shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              aba === item.id
                ? "border-brass-600 text-ink-900"
                : "border-transparent text-ink-400 hover:text-ink-700"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {aba === "consolidado" && (
        <div className="flex flex-col gap-8">
          <AIReportCard periodo={consolidado} />
          <ResumoTab periodo={consolidado} subtitulo="Consolidado (Itaú + Santander)" />
        </div>
      )}
      {aba === "itau-resumo" && <ResumoTab periodo={itau} subtitulo="Conta Itaú" />}
      {aba === "itau-lancamentos" && (
        <LancamentosTab conta="Itaú" lancamentos={lancamentosItau} />
      )}
      {aba === "santander-resumo" && <ResumoTab periodo={santander} subtitulo="Conta Santander" />}
      {aba === "santander-lancamentos" && (
        <LancamentosTab conta="Santander" lancamentos={lancamentosSantander} />
      )}
    </div>
  );
}
