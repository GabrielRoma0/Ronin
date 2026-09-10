import { redirect } from "next/navigation";
import { getSessao } from "@/lib/auth";
import { AppShell } from "@/components/ui/AppShell";
import { RelatorioApp } from "@/components/relatorio/RelatorioApp";
import { getEmpresaRealPorId } from "@/lib/data/empresas";

/**
 * O empresaId vem SOMENTE de getSessao() (resolvido no servidor a partir do
 * vínculo real em usuarios_empresas) — nunca de um parâmetro de URL, query
 * string ou estado do cliente. Esta é a garantia central de isolamento por
 * tenant da Visão Cliente, e agora ela é reforçada duas vezes: aqui em
 * código, e de novo pela política de RLS da própria consulta no banco.
 */
export default async function ClientePage() {
  const sessao = await getSessao();
  if (!sessao || sessao.role !== "cliente" || !sessao.empresaId) redirect("/");

  const empresaReal = await getEmpresaRealPorId(sessao.empresaId);

  return (
    <AppShell sessaoLabel={`Sessão: ${empresaReal?.nome ?? "cliente"}`}>
      {empresaReal ? (
        <RelatorioApp
          empresa={{ id: empresaReal.id, nome: empresaReal.nome, cnpj: empresaReal.cnpj, contas: [] }}
          viewer="cliente"
        />
      ) : (
        <div className="mx-auto max-w-3xl px-6 py-16 text-center text-ink-400">
          Não foi possível carregar os dados da sua empresa nesta sessão.
        </div>
      )}
    </AppShell>
  );
}
