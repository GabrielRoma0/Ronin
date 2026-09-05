"use client";

import { useParams } from "next/navigation";
import { RequireRole } from "@/components/auth/RequireRole";
import { AppShell } from "@/components/ui/AppShell";
import { RelatorioApp } from "@/components/relatorio/RelatorioApp";
import { getEmpresaPorId } from "@/data/access";

export default function AdminEmpresaDetalhePage() {
  const params = useParams<{ empresaId: string }>();
  // Lookup explícito por id vindo da URL — nunca por índice/posição.
  const empresa = getEmpresaPorId(params.empresaId);

  return (
    <RequireRole role="admin">
      <AppShell voltarParaAdmin>
        {empresa ? (
          <RelatorioApp empresa={empresa} viewer="admin" />
        ) : (
          <div className="mx-auto max-w-3xl px-6 py-16 text-center text-ink-400">
            Empresa não encontrada.
          </div>
        )}
      </AppShell>
    </RequireRole>
  );
}
