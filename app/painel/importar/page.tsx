import { redirect } from "next/navigation";
import { getSessao } from "@/lib/auth";
import { AppShell } from "@/components/ui/AppShell";
import { ImportarPage } from "@/components/importar/ImportarPage";
import { getEmpresaRealPorId } from "@/lib/data/empresas";
import { listarContasBasico } from "@/lib/data/relatorio";
import { listarItensCardapioReal } from "@/lib/data/cmv";

export default async function PainelImportarPage() {
  const sessao = await getSessao();
  if (!sessao || sessao.role !== "dono") redirect("/");

  const [empresa, contas, itensCardapio] = await Promise.all([
    getEmpresaRealPorId(sessao.empresaId),
    listarContasBasico(sessao.empresaId),
    listarItensCardapioReal(sessao.empresaId),
  ]);

  return (
    <AppShell sessaoLabel={`Sessão: ${sessao.username ?? "dono"}`} role="dono">
      <ImportarPage
        empresaId={sessao.empresaId}
        empresaCnpj={empresa?.cnpj ?? ""}
        contas={contas}
        itensCardapio={itensCardapio.map((i) => ({ id: i.id, nome: i.nome }))}
        voltarHref="/painel"
      />
    </AppShell>
  );
}
