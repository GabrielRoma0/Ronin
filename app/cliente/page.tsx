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

/**
 * O empresaId vem SOMENTE de getSessao() (resolvido no servidor a partir do
 * vínculo real em usuarios_empresas) — nunca de um parâmetro de URL, query
 * string ou estado do cliente. Esta é a garantia central de isolamento por
 * tenant da Visão Cliente, reforçada duas vezes: aqui em código, e de novo
 * pela política de RLS de cada consulta abaixo.
 */
export default async function ClientePage() {
  const sessao = await getSessao();
  if (!sessao || sessao.role !== "cliente" || !sessao.empresaId) redirect("/");

  const empresaId = sessao.empresaId;

  // empresaReal e contas não dependem um do outro — RLS já protege os dois
  // independentemente, então não há motivo pra esperar um pra pedir o outro.
  // O log também dispara aqui: só precisa terminar antes da resposta fechar,
  // não precisa atrasar nada que a pessoa vai ver na tela.
  const [empresaReal, contas] = await Promise.all([
    getEmpresaRealPorId(empresaId),
    listarContasReal(empresaId),
    registrarAcesso(empresaId, "visualizou_relatorio_cliente"),
  ]);

  if (!empresaReal) {
    return (
      <AppShell sessaoLabel="Sessão: cliente">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center text-ink-400">
          Não foi possível carregar os dados da sua empresa nesta sessão.
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
    <AppShell sessaoLabel={`Sessão: ${empresaReal.nome}`}>
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
        importarHref="/cliente/importar"
      />
    </AppShell>
  );
}
