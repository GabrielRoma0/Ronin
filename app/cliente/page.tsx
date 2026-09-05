"use client";

import { RequireRole } from "@/components/auth/RequireRole";
import { AppShell } from "@/components/ui/AppShell";
import { RelatorioApp } from "@/components/relatorio/RelatorioApp";
import { useSessao } from "@/lib/session";
import { getEmpresaPorId } from "@/data/access";

export default function ClientePage() {
  return (
    <RequireRole role="cliente">
      <ClienteConteudo />
    </RequireRole>
  );
}

/**
 * O empresaId vem SOMENTE da sessão (definido no login, ver lib/session.tsx)
 * — nunca de um parâmetro de URL, query string ou índice de lista. Esta é a
 * garantia central de isolamento por tenant da Visão Cliente: não existe
 * nenhum caminho de código aqui que aceite ou exiba dados de outra empresa.
 */
function ClienteConteudo() {
  const { sessao } = useSessao();
  const empresa = sessao?.empresaId ? getEmpresaPorId(sessao.empresaId) : undefined;

  return (
    <AppShell>
      {empresa ? (
        <RelatorioApp empresa={empresa} viewer="cliente" />
      ) : (
        <div className="mx-auto max-w-3xl px-6 py-16 text-center text-ink-400">
          Não foi possível carregar os dados da sua empresa nesta sessão.
        </div>
      )}
    </AppShell>
  );
}
