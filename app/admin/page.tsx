import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessao } from "@/lib/auth";
import { AppShell } from "@/components/ui/AppShell";
import { Valor } from "@/components/ui/Valor";
import { listarEmpresasReal } from "@/lib/data/empresas";
import { getPeriodoReal } from "@/lib/data/relatorio";

export default async function AdminPage() {
  const sessao = await getSessao();
  if (!sessao || sessao.role !== "admin") redirect("/");

  const empresas = await listarEmpresasReal();
  const resultados = await Promise.all(
    empresas.map(async (empresa) => ({
      ...empresa,
      resultadoFinal: (await getPeriodoReal(empresa.id)).indicadores.resultadoFinal,
    })),
  );

  return (
    <AppShell sessaoLabel="Sessão: Empresa Administradora (Admin)">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-brass-700">
            Visão Empresa Administradora
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-ink-900">
            Carteira de empresas
          </h1>
          <p className="mt-1 text-sm text-ink-400">
            {empresas.length} empresa{empresas.length === 1 ? "" : "s"} cadastrada
            {empresas.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-ink-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-200 bg-paper-50 text-left text-xs uppercase tracking-wide text-ink-400">
                <th className="px-5 py-3 font-medium">Empresa</th>
                <th className="px-5 py-3 font-medium">CNPJ</th>
                <th className="px-5 py-3 font-medium">Resultado do mês</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {resultados.map((empresa) => (
                <tr key={empresa.id} className="border-b border-ink-100 last:border-0">
                  <td className="px-5 py-4 font-medium text-ink-900">{empresa.nome}</td>
                  <td className="px-5 py-4 text-ink-400">{empresa.cnpj}</td>
                  <td className="px-5 py-4">
                    <Valor valor={empresa.resultadoFinal} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/empresas/${empresa.id}`}
                      className="text-sm font-medium text-ink-700 underline-offset-2 hover:underline"
                    >
                      Ver detalhe →
                    </Link>
                  </td>
                </tr>
              ))}
              {empresas.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-ink-300">
                    Nenhuma empresa cadastrada ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
