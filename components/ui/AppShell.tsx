import Image from "next/image";
import Link from "next/link";
import { SairButton } from "@/components/auth/SairButton";
import type { Role } from "@/lib/auth";

export function AppShell({
  children,
  sessaoLabel,
  role,
}: {
  children: React.ReactNode;
  /** Texto da sessão atual, já resolvido no servidor (ver lib/auth.ts). */
  sessaoLabel: string;
  /** Quando informado, mostra a navegação específica daquele papel (ex.: link de logs só pro dono). */
  role?: Role;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-ink-900 bg-ink-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-ronin.jpg"
              alt="Ronin Restaurante"
              width={36}
              height={36}
              className="rounded-full"
            />
            <span className="font-display text-lg font-semibold tracking-wide text-brass-300">
              RONIN
            </span>
            {role === "dono" && (
              <Link
                href="/painel/logs"
                className="ml-2 text-sm text-paper-300 underline-offset-2 hover:text-brass-300 hover:underline"
              >
                Log de acesso
              </Link>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-paper-300 sm:inline">{sessaoLabel}</span>
            <Link
              href="/conta"
              className="text-sm text-paper-300 underline-offset-2 hover:text-brass-300 hover:underline"
            >
              Minha conta
            </Link>
            <SairButton />
          </div>
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
