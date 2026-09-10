import { redirect } from "next/navigation";
import { getSessao } from "@/lib/auth";
import { AppShell } from "@/components/ui/AppShell";
import { RelatorioApp } from "@/components/relatorio/RelatorioApp";
import { getEmpresaRealPorId } from "@/lib/data/empresas";
import {
  calcularSaldoFinal,
  getLancamentosReal,
  getPeriodoReal,
  listarContasReal,
} from "@/lib/data/relatorio";
import { listarFuncionariosReal, listarPagamentosFuncionarios } from "@/lib/data/funcionarios";
import { registrarAcesso } from "@/lib/data/auditoria";

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
  // empresaReal e contas não dependem um do outro, e o log só precisa
  // terminar antes da resposta fechar — os três disparam juntos.
  const [empresaReal, contas] = await Promise.all([
    getEmpresaRealPorId(empresaId),
    listarContasReal(empresaId),
    registrarAcesso(empresaId, "visualizou_relatorio_admin"),
  ]);

  if (!empresaReal) {
    return (
      <AppShell sessaoLabel="Sessão: Empresa Administradora (Admin)" voltarParaAdmin>
        <div className="mx-auto max-w-3xl px-6 py-16 text-center text-ink-400">
          Empresa não encontrada.
        </div>
      </AppShell>
    );
  }

  const [periodoConsolidado, periodosPorContaEntries, lancamentosPorContaEntries, funcionarios, pagamentosFuncionarios] =
    await Promise.all([
      getPeriodoReal(empresaId),
      Promise.all(contas.map(async (c) => [c.id, await getPeriodoReal(empresaId, c.id)] as const)),
      Promise.all(contas.map(async (c) => [c.id, await getLancamentosReal(empresaId, c.id)] as const)),
      listarFuncionariosReal(empresaId),
      listarPagamentosFuncionarios(empresaId),
    ]);

  periodoConsolidado.saldoFinal = calcularSaldoFinal(contas);
  const periodosPorConta = Object.fromEntries(periodosPorContaEntries);
  for (const [contaId, periodo] of periodosPorContaEntries) {
    periodo.saldoFinal = calcularSaldoFinal(contas, contaId);
  }
  const lancamentosPorConta = Object.fromEntries(lancamentosPorContaEntries);

  return (
    <AppShell sessaoLabel="Sessão: Empresa Administradora (Admin)" voltarParaAdmin>
      <RelatorioApp
        empresaId={empresaId}
        empresaNome={empresaReal.nome}
        empresaCnpj={empresaReal.cnpj}
        contas={contas}
        periodoConsolidado={periodoConsolidado}
        periodosPorConta={periodosPorConta}
        lancamentosPorConta={lancamentosPorConta}
        funcionarios={funcionarios}
        pagamentosFuncionarios={pagamentosFuncionarios}
        importarHref={`/admin/empresas/${empresaId}/importar`}
      />
    </AppShell>
  );
}
