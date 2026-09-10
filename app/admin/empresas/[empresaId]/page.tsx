import { redirect } from "next/navigation";
import { getSessao } from "@/lib/auth";
import { AppShell } from "@/components/ui/AppShell";
import { RelatorioApp } from "@/components/relatorio/RelatorioApp";
import { getEmpresaRealPorId } from "@/lib/data/empresas";

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

  return (
    <AppShell sessaoLabel="Sessão: Empresa Administradora (Admin)" voltarParaAdmin>
      {empresaReal ? (
        <RelatorioApp
          empresa={{ id: empresaReal.id, nome: empresaReal.nome, cnpj: empresaReal.cnpj, contas: [] }}
          viewer="admin"
        />
      ) : (
        <div className="mx-auto max-w-3xl px-6 py-16 text-center text-ink-400">
          Empresa não encontrada.
        </div>
      )}
    </AppShell>
  );
}
