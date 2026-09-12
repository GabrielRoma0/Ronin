import { redirect } from "next/navigation";
import { getSessao } from "@/lib/auth";
import { AppShell } from "@/components/ui/AppShell";
import { TrocarUsernameForm } from "@/components/conta/TrocarUsernameForm";
import { TrocarSenhaForm } from "@/components/conta/TrocarSenhaForm";
import { EquipeTab } from "@/components/equipe/EquipeTab";
import { listarEquipe } from "@/lib/actions/equipe";

/**
 * Área de configuração pessoal — qualquer papel logado acessa a própria
 * conta (não é exclusiva do dono). Cada usuário só enxerga e só altera os
 * próprios dados; não existe seleção de qual usuário editar.
 */
export default async function ContaPage() {
  const sessao = await getSessao();
  if (!sessao) redirect("/");

  const voltarHref = sessao.role === "dono" ? "/painel" : "/caixa";
  const equipe = sessao.role === "dono" ? await listarEquipe() : [];

  return (
    <AppShell sessaoLabel={`Sessão: ${sessao.username ?? sessao.role}`} role={sessao.role}>
      <div className="mx-auto flex max-w-lg flex-col gap-8 px-6 py-10">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-brass-700">Minha conta</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-ink-900">Configurações</h1>
          <p className="mt-1 text-sm text-ink-400">Troque seu usuário ou sua senha de acesso.</p>
        </div>

        <section className="rounded-xl border border-ink-200 bg-paper-50 p-5">
          <h2 className="mb-3 font-display text-lg font-semibold text-ink-900">Usuário</h2>
          <TrocarUsernameForm usernameAtual={sessao.username ?? ""} />
        </section>

        <section className="rounded-xl border border-ink-200 bg-paper-50 p-5">
          <h2 className="mb-3 font-display text-lg font-semibold text-ink-900">Senha</h2>
          <TrocarSenhaForm />
        </section>

        {sessao.role === "dono" && (
          <section className="rounded-xl border border-ink-200 bg-paper-50 p-5">
            <h2 className="mb-3 font-display text-lg font-semibold text-ink-900">Equipe</h2>
            <EquipeTab membros={equipe.filter((m) => m.userId !== sessao.userId)} />
          </section>
        )}

        <a
          href={voltarHref}
          className="self-start text-sm text-ink-400 underline-offset-2 hover:text-ink-700 hover:underline"
        >
          ← voltar
        </a>
      </div>
    </AppShell>
  );
}
