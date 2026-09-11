import { redirect } from "next/navigation";
import { getSessao } from "@/lib/auth";
import { AppShell } from "@/components/ui/AppShell";
import { ImportarPage } from "@/components/importar/ImportarPage";
import { listarContasBasico } from "@/lib/data/relatorio";
import { registrarAcesso } from "@/lib/data/auditoria";

/**
 * Página do funcionário: só lançar notas (CSV/NF-e) e fechar o caixa do dia.
 * Nunca busca nem recebe nada do relatório financeiro — não é só uma questão
 * de não mostrar na tela, as políticas de RLS de `contas`/`lancamentos`
 * (select) já bloqueiam esse papel no banco, então mesmo um bug aqui não
 * vaza saldo ou histórico.
 */
export default async function CaixaPage() {
  const sessao = await getSessao();
  if (!sessao || sessao.role !== "funcionario") redirect("/");

  const [contas] = await Promise.all([
    listarContasBasico(sessao.empresaId),
    registrarAcesso(sessao.empresaId, "acessou_caixa"),
  ]);

  return (
    <AppShell sessaoLabel={`Sessão: ${sessao.username ?? "funcionário"}`} role="funcionario">
      <ImportarPage
        empresaId={sessao.empresaId}
        empresaCnpj=""
        contas={contas}
        voltarHref="/caixa"
        voltarLabel="← lançar outro"
      />
    </AppShell>
  );
}
