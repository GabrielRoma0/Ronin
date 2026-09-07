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
  | "banco-a-resumo"
  | "banco-a-lancamentos"
  | "banco-b-resumo"
  | "banco-b-lancamentos";

const ABAS: { id: AbaId; label: string }[] = [
  { id: "consolidado", label: "Resumo Consolidado" },
  { id: "banco-a-resumo", label: "Resumo Banco A" },
  { id: "banco-a-lancamentos", label: "Lançamentos Banco A" },
  { id: "banco-b-resumo", label: "Resumo Banco B" },
  { id: "banco-b-lancamentos", label: "Lançamentos Banco B" },
];

/**
 * Componente único usado tanto pela Visão Cliente quanto pelo detalhe da
 * Visão Admin. O `empresa` sempre chega explícito via props — este
 * componente nunca busca dados por conta própria a partir de estado global.
 */
export function RelatorioApp({ empresa }: { empresa: Empresa; viewer: "admin" | "cliente" }) {
  const [aba, setAba] = useState<AbaId>("consolidado");

  const consolidado = getPeriodo(empresa.id);
  const bancoA = getPeriodo(empresa.id, "Banco A");
  const bancoB = getPeriodo(empresa.id, "Banco B");
  const lancamentosBancoA = getLancamentos(empresa.id, "Banco A");
  const lancamentosBancoB = getLancamentos(empresa.id, "Banco B");

  if (!consolidado || !bancoA || !bancoB) {
    return <p className="p-8 text-ink-400">Não há dados para esta empresa.</p>;
  }

  const contaBancoA = empresa.contas.find((c) => c.banco === "Banco A");
  const contaBancoB = empresa.contas.find((c) => c.banco === "Banco B");

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-400">
            {empresa.cnpj}
          </p>
          <h1 className="font-display text-3xl font-semibold text-ink-900">{empresa.nome}</h1>
          <p className="mt-1 text-sm text-ink-400">
            Banco A · {contaBancoA?.titular} &nbsp;·&nbsp; Banco B · {contaBancoB?.titular}
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
          <ResumoTab periodo={consolidado} subtitulo="Consolidado (Banco A + Banco B)" />
        </div>
      )}
      {aba === "banco-a-resumo" && <ResumoTab periodo={bancoA} subtitulo="Conta Banco A" />}
      {aba === "banco-a-lancamentos" && (
        <LancamentosTab conta="Banco A" lancamentos={lancamentosBancoA} />
      )}
      {aba === "banco-b-resumo" && <ResumoTab periodo={bancoB} subtitulo="Conta Banco B" />}
      {aba === "banco-b-lancamentos" && (
        <LancamentosTab conta="Banco B" lancamentos={lancamentosBancoB} />
      )}
    </div>
  );
}
