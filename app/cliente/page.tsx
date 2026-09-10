import { redirect } from "next/navigation";
import { getSessao } from "@/lib/auth";
import { AppShell } from "@/components/ui/AppShell";
import { RelatorioApp } from "@/components/relatorio/RelatorioApp";
import { getEmpresaRealPorId } from "@/lib/data/empresas";
import { getLancamentosReal, getPeriodoReal, listarContasReal } from "@/lib/data/relatorio";

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
  const empresaReal = await getEmpresaRealPorId(empresaId);

  if (!empresaReal) {
    return (
      <AppShell sessaoLabel="Sessão: cliente">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center text-ink-400">
          Não foi possível carregar os dados da sua empresa nesta sessão.
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
    <AppShell sessaoLabel={`Sessão: ${empresaReal.nome}`}>
      <RelatorioApp
        empresaNome={empresaReal.nome}
        empresaCnpj={empresaReal.cnpj}
        contas={contas}
        periodoConsolidado={periodoConsolidado}
        periodosPorConta={periodosPorConta}
        lancamentosPorConta={lancamentosPorConta}
        importarHref="/cliente/importar"
      />
    </AppShell>
  );
}
