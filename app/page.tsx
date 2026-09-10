import { redirect } from "next/navigation";
import { getSessao } from "@/lib/auth";
import { LoginForm } from "@/components/auth/LoginForm";

export default async function LoginPage() {
  const sessao = await getSessao();
  if (sessao?.role === "admin") redirect("/admin");
  if (sessao?.role === "cliente") redirect("/cliente");

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="grid w-full max-w-4xl gap-12 md:grid-cols-2 md:items-center">
        <div className="animate-fade-up">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-700">
            Controle financeiro multi-cliente
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-ink-900 sm:text-5xl">
            O fechamento do mês,
            <br />
            sem <span className="katana-mark">planilha</span> e sem WhatsApp perdido.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-ink-500">
            A plataforma acompanha o P&amp;L de cada empresa contratante em um único
            lugar — substituindo a rotina manual de Excel e mensagens soltas por um
            relatório vivo, com as mesmas 5 abas de sempre.
          </p>
        </div>

        <div className="animate-fade-up rounded-2xl border border-ink-200 bg-paper-50 p-8 shadow-[0_1px_0_0_rgba(16,21,31,0.04)]">
          <h2 className="font-display text-lg font-semibold text-ink-900">Entrar</h2>
          <p className="mt-1 text-sm text-ink-400">Use o e-mail e senha da sua conta.</p>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
