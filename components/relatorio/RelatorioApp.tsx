"use client";

import { useState } from "react";
import type { Periodo } from "@/data/seed";
import type { ContaReal, LancamentoReal } from "@/lib/data/relatorio";
import { ResumoTab } from "./ResumoTab";
import { LancamentosTab } from "./LancamentosTab";
import { AIReportCard } from "./AIReportCard";
import { WhatsAppSimButton } from "./WhatsAppSimButton";

interface RelatorioAppProps {
  empresaNome: string;
  empresaCnpj: string;
  /** Contas reais da empresa — pode ser 0, 1 ou N; nada aqui assume exatamente duas. */
  contas: ContaReal[];
  periodoConsolidado: Periodo;
  /** Chave = conta.id */
  periodosPorConta: Record<string, Periodo>;
  lancamentosPorConta: Record<string, LancamentoReal[]>;
}

type Aba = { tipo: "consolidado" } | { tipo: "resumo-conta"; contaId: string } | { tipo: "lancamentos-conta"; contaId: string };

function chaveAba(aba: Aba): string {
  if (aba.tipo === "consolidado") return "consolidado";
  return `${aba.tipo}-${aba.contaId}`;
}

/**
 * Componente único usado tanto pela Visão Cliente quanto pelo detalhe da
 * Visão Admin. Todos os dados chegam já resolvidos via props (buscados no
 * servidor por lib/data/relatorio.ts, respeitando RLS) — este componente
 * nunca busca nada por conta própria a partir de estado global.
 */
export function RelatorioApp({
  empresaNome,
  empresaCnpj,
  contas,
  periodoConsolidado,
  periodosPorConta,
  lancamentosPorConta,
}: RelatorioAppProps) {
  const [aba, setAba] = useState<Aba>({ tipo: "consolidado" });

  const abas: { aba: Aba; label: string }[] = [
    { aba: { tipo: "consolidado" }, label: "Resumo Consolidado" },
    ...contas.flatMap((conta) => [
      { aba: { tipo: "resumo-conta" as const, contaId: conta.id }, label: `Resumo ${conta.banco}` },
      { aba: { tipo: "lancamentos-conta" as const, contaId: conta.id }, label: `Lançamentos ${conta.banco}` },
    ]),
  ];

  const nomesContas = contas.map((c) => c.banco).join(" + ") || "nenhuma conta cadastrada";

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-400">{empresaCnpj}</p>
          <h1 className="font-display text-3xl font-semibold text-ink-900">{empresaNome}</h1>
          <p className="mt-1 text-sm text-ink-400">
            {contas.length === 0
              ? "Nenhuma conta bancária cadastrada ainda"
              : contas.map((c) => `${c.banco} · ${c.titular}`).join("  ·  ")}
          </p>
        </div>
        <WhatsAppSimButton empresaNome={empresaNome} periodo={periodoConsolidado} />
      </div>

      <nav className="flex gap-1 overflow-x-auto border-b border-ink-200">
        {abas.map((item) => (
          <button
            key={chaveAba(item.aba)}
            type="button"
            onClick={() => setAba(item.aba)}
            className={`shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              chaveAba(aba) === chaveAba(item.aba)
                ? "border-brass-600 text-ink-900"
                : "border-transparent text-ink-400 hover:text-ink-700"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {aba.tipo === "consolidado" && (
        <div className="flex flex-col gap-8">
          <AIReportCard periodo={periodoConsolidado} />
          <ResumoTab periodo={periodoConsolidado} subtitulo={`Consolidado (${nomesContas})`} />
        </div>
      )}
      {aba.tipo === "resumo-conta" &&
        (() => {
          const conta = contas.find((c) => c.id === aba.contaId);
          const periodo = periodosPorConta[aba.contaId];
          if (!conta || !periodo) return null;
          return <ResumoTab periodo={periodo} subtitulo={`Conta ${conta.banco}`} />;
        })()}
      {aba.tipo === "lancamentos-conta" &&
        (() => {
          const conta = contas.find((c) => c.id === aba.contaId);
          if (!conta) return null;
          return (
            <LancamentosTab conta={conta.banco} lancamentos={lancamentosPorConta[aba.contaId] ?? []} />
          );
        })()}
    </div>
  );
}
