import Link from "next/link";
import { SairButton } from "@/components/auth/SairButton";

export function AppShell({
  children,
  sessaoLabel,
  voltarParaAdmin,
}: {
  children: React.ReactNode;
  /** Texto da sessão atual, já resolvido no servidor (ver lib/auth.ts). */
  sessaoLabel: string;
  /** Mostra um link "← voltar à carteira" (usado na tela de detalhe do admin). */
  voltarParaAdmin?: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-ink-200 bg-paper-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="katana-mark font-display text-lg font-semibold text-ink-900">
              Empresa Administradora
            </span>
            {voltarParaAdmin && (
              <Link
                href="/admin"
                className="ml-2 text-sm text-ink-400 underline-offset-2 hover:text-ink-700 hover:underline"
              >
                ← voltar à carteira de clientes
              </Link>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-ink-400 sm:inline">{sessaoLabel}</span>
            <SairButton />
          </div>
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
