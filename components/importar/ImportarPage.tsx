"use client";

import { useState } from "react";
import { ImportarCsvForm } from "./ImportarCsvForm";
import { ImportarNotaFiscalForm } from "./ImportarNotaFiscalForm";
import { ImportarFotoNotaForm } from "./ImportarFotoNotaForm";
import { ImportarExtratoPdfForm } from "./ImportarExtratoPdfForm";
import { CaixaDoDiaForm } from "./CaixaDoDiaForm";
import { ImportarVendas99Form } from "./ImportarVendas99Form";
import type { ItemCardapioBasico } from "@/lib/import/vendas99";

interface ContaOpcao {
  id: string;
  banco: string;
}

const ABAS_BASE = [
  { id: "caixa", label: "Caixa do dia" },
  { id: "foto", label: "Foto da nota" },
  { id: "csv", label: "Extrato (CSV)" },
  { id: "pdf", label: "Extrato (PDF)" },
  { id: "nfe", label: "Nota Fiscal (XML)" },
] as const;

const ABA_VENDAS_99 = { id: "vendas99", label: "Vendas 99Food (CSV)" } as const;

export function ImportarPage({
  empresaId,
  empresaCnpj,
  contas,
  itensCardapio,
  voltarHref,
  voltarLabel,
}: {
  empresaId: string;
  empresaCnpj: string;
  contas: ContaOpcao[];
  /**
   * Omitido (undefined) pro papel funcionário — Vendas 99Food cruza com a
   * ficha técnica de Custo de Mercadoria, dado estratégico dono-only, então
   * nem a aba aparece nesse caso (RLS já bloquearia o dado, isso só evita
   * mostrar uma aba que sempre viria vazia).
   */
  itensCardapio?: ItemCardapioBasico[];
  voltarHref: string;
  voltarLabel?: string;
}) {
  const ABAS = itensCardapio ? [...ABAS_BASE, ABA_VENDAS_99] : ABAS_BASE;
  const [fonte, setFonte] = useState<(typeof ABAS)[number]["id"]>("caixa");

  return (
    <div className="flex flex-col">
      <div className="mx-auto flex w-full max-w-4xl gap-1 overflow-x-auto border-b border-ink-200 px-6 pt-6">
        {ABAS.map((aba) => (
          <button
            key={aba.id}
            type="button"
            onClick={() => setFonte(aba.id)}
            className={`shrink-0 px-4 py-2.5 text-sm font-medium transition-colors ${
              fonte === aba.id
                ? "border-b-2 border-brass-600 text-ink-900"
                : "text-ink-400 hover:text-ink-700"
            }`}
          >
            {aba.label}
          </button>
        ))}
      </div>

      {fonte === "caixa" && (
        <CaixaDoDiaForm
          empresaId={empresaId}
          contas={contas}
          voltarHref={voltarHref}
          voltarLabel={voltarLabel}
        />
      )}
      {fonte === "foto" && (
        <ImportarFotoNotaForm
          empresaId={empresaId}
          contas={contas}
          voltarHref={voltarHref}
          voltarLabel={voltarLabel}
        />
      )}
      {fonte === "csv" && (
        <ImportarCsvForm
          empresaId={empresaId}
          contas={contas}
          voltarHref={voltarHref}
          voltarLabel={voltarLabel}
        />
      )}
      {fonte === "pdf" && (
        <ImportarExtratoPdfForm
          empresaId={empresaId}
          contas={contas}
          voltarHref={voltarHref}
          voltarLabel={voltarLabel}
        />
      )}
      {fonte === "nfe" && (
        <ImportarNotaFiscalForm
          empresaId={empresaId}
          empresaCnpj={empresaCnpj}
          contas={contas}
          voltarHref={voltarHref}
          voltarLabel={voltarLabel}
        />
      )}
      {fonte === "vendas99" && itensCardapio && (
        <ImportarVendas99Form
          empresaId={empresaId}
          itensCardapio={itensCardapio}
          voltarHref={voltarHref}
          voltarLabel={voltarLabel}
        />
      )}
    </div>
  );
}
