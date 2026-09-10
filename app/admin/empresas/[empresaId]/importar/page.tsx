import { redirect } from "next/navigation";
import { getSessao } from "@/lib/auth";
import { AppShell } from "@/components/ui/AppShell";
import { ImportarPage } from "@/components/importar/ImportarPage";
import { getEmpresaRealPorId } from "@/lib/data/empresas";
import { listarContasReal } from "@/lib/data/relatorio";

export default async function AdminImportarPage({
  params,
}: {
  params: Promise<{ empresaId: string }>;
}) {
  const sessao = await getSessao();
  if (!sessao || sessao.role !== "admin") redirect("/");

  const { empresaId } = await params;
  const empresa = await getEmpresaRealPorId(empresaId);
  if (!empresa) redirect("/admin");

  const contas = await listarContasReal(empresaId);

  return (
    <AppShell sessaoLabel="Sessão: Empresa Administradora (Admin)" voltarParaAdmin>
      <ImportarPage
        empresaId={empresaId}
        empresaCnpj={empresa.cnpj}
        contas={contas}
        voltarHref={`/admin/empresas/${empresaId}`}
      />
    </AppShell>
  );
}
