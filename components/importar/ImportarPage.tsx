"use client";

import { useState } from "react";
import { ImportarCsvForm } from "./ImportarCsvForm";
import { ImportarNotaFiscalForm } from "./ImportarNotaFiscalForm";

interface ContaOpcao {
  id: string;
  banco: string;
}

export function ImportarPage({
  empresaId,
  empresaCnpj,
  contas,
  voltarHref,
}: {
  empresaId: string;
  empresaCnpj: string;
  contas: ContaOpcao[];
  voltarHref: string;
}) {
  const [fonte, setFonte] = useState<"csv" | "nfe">("csv");

  return (
    <div className="flex flex-col">
      <div className="mx-auto flex w-full max-w-4xl gap-1 border-b border-ink-200 px-6 pt-6">
        <button
          type="button"
          onClick={() => setFonte("csv")}
          className={`px-4 py-2.5 text-sm font-medium transition-colors ${
            fonte === "csv"
              ? "border-b-2 border-brass-600 text-ink-900"
              : "text-ink-400 hover:text-ink-700"
          }`}
        >
          Extrato (CSV)
        </button>
        <button
          type="button"
          onClick={() => setFonte("nfe")}
          className={`px-4 py-2.5 text-sm font-medium transition-colors ${
            fonte === "nfe"
              ? "border-b-2 border-brass-600 text-ink-900"
              : "text-ink-400 hover:text-ink-700"
          }`}
        >
          Nota Fiscal (XML)
        </button>
      </div>

      {fonte === "csv" ? (
        <ImportarCsvForm empresaId={empresaId} contas={contas} voltarHref={voltarHref} />
      ) : (
        <ImportarNotaFiscalForm
          empresaId={empresaId}
          empresaCnpj={empresaCnpj}
          contas={contas}
          voltarHref={voltarHref}
        />
      )}
    </div>
  );
}
