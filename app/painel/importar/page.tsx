import { redirect } from "next/navigation";
import { getSessao } from "@/lib/auth";
import { AppShell } from "@/components/ui/AppShell";
import { ImportarPage } from "@/components/importar/ImportarPage";
import { getEmpresaRealPorId } from "@/lib/data/empresas";
import { listarContasBasico } from "@/lib/data/relatorio";

export default async function PainelImportarPage() {
  const sessao = await getSessao();
  if (!sessao || sessao.role !== "dono") redirect("/");

  const empresa = await getEmpresaRealPorId(sessao.empresaId);
  const contas = await listarContasBasico(sessao.empresaId);

  return (
    <AppShell sessaoLabel={`Sessão: ${sessao.username ?? "dono"}`} role="dono">
      <ImportarPage
        empresaId={sessao.empresaId}
        empresaCnpj={empresa?.cnpj ?? ""}
        contas={contas}
        voltarHref="/painel"
      />
    </AppShell>
  );
}
