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
import { montarDashboardKPIs } from "@/lib/data/dashboard";
import { getPeriodosUltimos6Meses, montarComparativoMesAMes, montarEvolucao6Meses } from "@/lib/data/graficos";
import {
  listarAvaliacoesReal,
  listarFuncionariosReal,
  listarPagamentosFuncionarios,
} from "@/lib/data/funcionarios";
import { listarSociosReal } from "@/lib/data/socios";
import { registrarAcesso } from "@/lib/data/auditoria";

/**
 * Página do dono — acesso 100% (relatório completo). O empresaId vem SOMENTE
 * de getSessao() (resolvido no servidor a partir do vínculo real em
 * usuarios_empresas) — nunca de um parâmetro de URL, query string ou estado
 * do cliente. Essa é a garantia de isolamento por tenant, reforçada de novo
 * pela política de RLS de cada consulta abaixo (só dono lê estas tabelas).
 */
export default async function PainelPage() {
  const sessao = await getSessao();
  if (!sessao || sessao.role !== "dono") redirect("/");

  const empresaId = sessao.empresaId;

  const [empresaReal, contas] = await Promise.all([
    getEmpresaRealPorId(empresaId),
    listarContasReal(empresaId),
    registrarAcesso(empresaId, "visualizou_relatorio"),
  ]);

  if (!empresaReal) {
    return (
      <AppShell sessaoLabel={`Sessão: ${sessao.username ?? "dono"}`} role="dono">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center text-ink-400">
          Não foi possível carregar os dados da empresa nesta sessão.
        </div>
      </AppShell>
    );
  }

  const [
    { periodos: periodosUltimos6Meses, refs: refsUltimos6Meses },
    periodosPorContaEntries,
    lancamentosPorContaEntries,
    funcionarios,
    pagamentosFuncionarios,
    socios,
    avaliacoesFuncionarios,
  ] = await Promise.all([
    getPeriodosUltimos6Meses(empresaId),
    Promise.all(contas.map(async (c) => [c.id, await getPeriodoReal(empresaId, c.id)] as const)),
    Promise.all(contas.map(async (c) => [c.id, await getLancamentosReal(empresaId, c.id)] as const)),
    listarFuncionariosReal(empresaId),
    listarPagamentosFuncionarios(empresaId),
    listarSociosReal(empresaId),
    listarAvaliacoesReal(empresaId),
  ]);

  // O mês atual (último elemento) já veio de getPeriodosUltimos6Meses — nada
  // aqui repete uma consulta que os gráficos/KPIs também precisam.
  const periodoConsolidado = periodosUltimos6Meses[periodosUltimos6Meses.length - 1];
  const periodoAnterior = periodosUltimos6Meses[periodosUltimos6Meses.length - 2];
  periodoConsolidado.saldoFinal = calcularSaldoFinal(contas);
  const kpis = montarDashboardKPIs(periodoConsolidado, periodoAnterior, contas);
  const comparativoMesAMes = montarComparativoMesAMes(periodosUltimos6Meses, refsUltimos6Meses);
  const evolucao6Meses = montarEvolucao6Meses(periodosUltimos6Meses, refsUltimos6Meses);

  const periodosPorConta = Object.fromEntries(periodosPorContaEntries);
  for (const [contaId, periodo] of periodosPorContaEntries) {
    periodo.saldoFinal = calcularSaldoFinal(contas, contaId);
  }
  const lancamentosPorConta = Object.fromEntries(lancamentosPorContaEntries);

  return (
    <AppShell sessaoLabel={`Sessão: ${sessao.username ?? "dono"}`} role="dono">
      <RelatorioApp
        empresaId={empresaId}
        empresaNome={empresaReal.nome}
        empresaCnpj={empresaReal.cnpj}
        contas={contas}
        kpis={kpis}
        comparativoMesAMes={comparativoMesAMes}
        evolucao6Meses={evolucao6Meses}
        periodoConsolidado={periodoConsolidado}
        periodosPorConta={periodosPorConta}
        lancamentosPorConta={lancamentosPorConta}
        funcionarios={funcionarios}
        pagamentosFuncionarios={pagamentosFuncionarios}
        avaliacoesFuncionarios={avaliacoesFuncionarios}
        socios={socios}
        importarHref="/painel/importar"
      />
    </AppShell>
  );
}
