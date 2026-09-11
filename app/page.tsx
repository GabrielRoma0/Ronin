import Image from "next/image";
import { redirect } from "next/navigation";
import { getSessao } from "@/lib/auth";
import { LoginForm } from "@/components/auth/LoginForm";
import { BrushMarks } from "@/components/ui/BrushMarks";

export default async function LoginPage() {
  const sessao = await getSessao();
  if (sessao?.role === "dono") redirect("/painel");
  if (sessao?.role === "funcionario") redirect("/caixa");

  return (
    <main className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden bg-ink-900 px-6 py-16">
      <BrushMarks />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center text-center">
        <div className="animate-logo-entrada">
          <Image
            src="/logo-ronin.jpg"
            alt="Ronin Restaurante"
            width={176}
            height={176}
            className="rounded-full shadow-[0_0_60px_-15px_rgba(212,175,90,0.35)]"
            priority
          />
        </div>

        <p className="mt-6 font-display text-base font-semibold uppercase tracking-[0.25em] text-brass-500">
          <span className="katana-mark">Controle financeiro</span>
        </p>

        <div className="animate-fade-up mt-10 w-full rounded-2xl border border-ink-700 bg-paper-50 p-8 text-left shadow-[0_1px_0_0_rgba(16,21,31,0.04)]">
          <h2 className="font-display text-lg font-semibold text-ink-900">Entrar</h2>
          <p className="mt-1 text-sm text-ink-400">Use o usuário e a senha da sua conta.</p>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
