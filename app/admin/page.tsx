"use client";

import Link from "next/link";
import { RequireRole } from "@/components/auth/RequireRole";
import { AppShell } from "@/components/ui/AppShell";
import { Valor } from "@/components/ui/Valor";
import { listarResumoAdmin } from "@/data/access";

export default function AdminPage() {
  const empresas = listarResumoAdmin();

  return (
    <RequireRole role="admin">
      <AppShell>
        <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-brass-700">
              Visão Empresa Administradora
            </p>
            <h1 className="mt-1 font-display text-3xl font-semibold text-ink-900">
              Carteira de empresas
            </h1>
            <p className="mt-1 text-sm text-ink-400">
              Fechamento de Agosto/2026 · {empresas.length} empresa
              {empresas.length === 1 ? "" : "s"} acompanhada{empresas.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-ink-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-200 bg-paper-50 text-left text-xs uppercase tracking-wide text-ink-400">
                  <th className="px-5 py-3 font-medium">Empresa</th>
                  <th className="px-5 py-3 font-medium">Resultado Final</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {empresas.map((linha) => (
                  <tr key={linha.empresaId} className="border-b border-ink-100 last:border-0">
                    <td className="px-5 py-4 font-medium text-ink-900">{linha.nome}</td>
                    <td className="px-5 py-4 text-base">
                      <Valor valor={linha.resultadoFinal} />
                    </td>
                    <td className="px-5 py-4">
                      {linha.emQueda ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                          <span aria-hidden>▼</span> Queda no resultado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                          <span aria-hidden>▲</span> Resultado positivo
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/empresas/${linha.empresaId}`}
                        className="text-sm font-medium text-ink-700 underline-offset-2 hover:underline"
                      >
                        Ver detalhe →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AppShell>
    </RequireRole>
  );
}
