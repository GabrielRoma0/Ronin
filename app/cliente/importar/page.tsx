import { redirect } from "next/navigation";
import { getSessao } from "@/lib/auth";
import { AppShell } from "@/components/ui/AppShell";
import { ImportarCsvForm } from "@/components/importar/ImportarCsvForm";
import { listarContasReal } from "@/lib/data/relatorio";

export default async function ClienteImportarPage() {
  const sessao = await getSessao();
  if (!sessao || sessao.role !== "cliente" || !sessao.empresaId) redirect("/");

  const contas = await listarContasReal(sessao.empresaId);

  return (
    <AppShell sessaoLabel={`Sessão: ${sessao.email ?? "cliente"}`}>
      <ImportarCsvForm empresaId={sessao.empresaId} contas={contas} voltarHref="/cliente" />
    </AppShell>
  );
}
