import { redirect } from "next/navigation";
import { getSessao } from "@/lib/auth";
import { AppShell } from "@/components/ui/AppShell";
import { ImportarPage } from "@/components/importar/ImportarPage";
import { getEmpresaRealPorId } from "@/lib/data/empresas";
import { listarContasReal } from "@/lib/data/relatorio";

export default async function ClienteImportarPage() {
  const sessao = await getSessao();
  if (!sessao || sessao.role !== "cliente" || !sessao.empresaId) redirect("/");

  const empresa = await getEmpresaRealPorId(sessao.empresaId);
  const contas = await listarContasReal(sessao.empresaId);

  return (
    <AppShell sessaoLabel={`Sessão: ${sessao.email ?? "cliente"}`}>
      <ImportarPage
        empresaId={sessao.empresaId}
        empresaCnpj={empresa?.cnpj ?? ""}
        contas={contas}
        voltarHref="/cliente"
      />
    </AppShell>
  );
}
