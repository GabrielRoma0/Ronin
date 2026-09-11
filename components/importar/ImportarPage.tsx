"use client";

import { useState } from "react";
import { ImportarCsvForm } from "./ImportarCsvForm";
import { ImportarNotaFiscalForm } from "./ImportarNotaFiscalForm";
import { ImportarFotoNotaForm } from "./ImportarFotoNotaForm";
import { ImportarExtratoPdfForm } from "./ImportarExtratoPdfForm";
import { CaixaDoDiaForm } from "./CaixaDoDiaForm";

interface ContaOpcao {
  id: string;
  banco: string;
}

const ABAS = [
  { id: "caixa", label: "Caixa do dia" },
  { id: "foto", label: "Foto da nota" },
  { id: "csv", label: "Extrato (CSV)" },
  { id: "pdf", label: "Extrato (PDF)" },
  { id: "nfe", label: "Nota Fiscal (XML)" },
] as const;

export function ImportarPage({
  empresaId,
  empresaCnpj,
  contas,
  voltarHref,
  voltarLabel,
}: {
  empresaId: string;
  empresaCnpj: string;
  contas: ContaOpcao[];
  voltarHref: string;
  voltarLabel?: string;
}) {
  const [fonte, setFonte] = useState<(typeof ABAS)[number]["id"]>("caixa");

  return (
    <div className="flex flex-col">
      <div className="mx-auto flex w-full max-w-4xl gap-1 border-b border-ink-200 px-6 pt-6">
        {ABAS.map((aba) => (
          <button
            key={aba.id}
            type="button"
            onClick={() => setFonte(aba.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
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
    </div>
  );
}
