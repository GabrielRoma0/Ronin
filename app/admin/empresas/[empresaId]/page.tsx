import { redirect } from "next/navigation";
import { getSessao } from "@/lib/auth";
import { AppShell } from "@/components/ui/AppShell";
import { RelatorioApp } from "@/components/relatorio/RelatorioApp";
import { getEmpresaRealPorId } from "@/lib/data/empresas";
import { getLancamentosReal, getPeriodoReal, listarContasReal } from "@/lib/data/relatorio";

export default async function AdminEmpresaDetalhePage({
  params,
}: {
  params: Promise<{ empresaId: string }>;
}) {
  const sessao = await getSessao();
  if (!sessao || sessao.role !== "admin") redirect("/");

  const { empresaId } = await params;
  // Lookup explícito por id vindo da URL, resolvido pelo Postgres — nunca
  // por índice/posição. RLS garante que um admin pode ver qualquer empresa.
  const empresaReal = await getEmpresaRealPorId(empresaId);

  if (!empresaReal) {
    return (
      <AppShell sessaoLabel="Sessão: Empresa Administradora (Admin)" voltarParaAdmin>
        <div className="mx-auto max-w-3xl px-6 py-16 text-center text-ink-400">
          Empresa não encontrada.
        </div>
      </AppShell>
    );
  }

  const contas = await listarContasReal(empresaId);
  const periodoConsolidado = await getPeriodoReal(empresaId);
  const periodosPorConta = Object.fromEntries(
    await Promise.all(contas.map(async (c) => [c.id, await getPeriodoReal(empresaId, c.id)] as const)),
  );
  const lancamentosPorConta = Object.fromEntries(
    await Promise.all(
      contas.map(async (c) => [c.id, await getLancamentosReal(empresaId, c.id)] as const),
    ),
  );

  return (
    <AppShell sessaoLabel="Sessão: Empresa Administradora (Admin)" voltarParaAdmin>
      <RelatorioApp
        empresaNome={empresaReal.nome}
        empresaCnpj={empresaReal.cnpj}
        contas={contas}
        periodoConsolidado={periodoConsolidado}
        periodosPorConta={periodosPorConta}
        lancamentosPorConta={lancamentosPorConta}
      />
    </AppShell>
  );
}
