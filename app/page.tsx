import Image from "next/image";
import { redirect } from "next/navigation";
import { getSessao } from "@/lib/auth";
import { LoginForm } from "@/components/auth/LoginForm";

export default async function LoginPage() {
  const sessao = await getSessao();
  if (sessao?.role === "dono") redirect("/painel");
  if (sessao?.role === "funcionario") redirect("/caixa");

  return (
    <main className="flex flex-1 items-center justify-center bg-ink-900 px-6 py-16">
      <div className="grid w-full max-w-4xl gap-12 md:grid-cols-2 md:items-center">
        <div className="animate-fade-up">
          <Image src="/logo-ronin.jpg" alt="Ronin Restaurante" width={64} height={64} className="rounded-full" />
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-brass-500">
            Controle financeiro
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-paper-100 sm:text-5xl">
            O fechamento do mês,
            <br />
            sem <span className="katana-mark">planilha</span> e sem WhatsApp perdido.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-paper-300">
            O painel acompanha o P&amp;L da Ronin em um único lugar — substituindo a
            rotina manual de Excel e mensagens soltas por um relatório vivo.
          </p>
        </div>

        <div className="animate-fade-up rounded-2xl border border-ink-700 bg-paper-50 p-8 shadow-[0_1px_0_0_rgba(16,21,31,0.04)]">
          <h2 className="font-display text-lg font-semibold text-ink-900">Entrar</h2>
          <p className="mt-1 text-sm text-ink-400">Use o usuário e a senha da sua conta.</p>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
