/**
 * Bloco de skeleton — pulsa via Tailwind `animate-pulse`, que fica estático
 * sob `prefers-reduced-motion: reduce` (ver app/globals.css). Usado nos
 * `loading.tsx` de cada rota, nunca em conteúdo real.
 */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-paper-200 ${className}`} />;
}

/** Barra escura repetindo o cabeçalho fixo do AppShell, sem dado de sessão. */
export function AppShellSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-ink-900 bg-ink-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 animate-pulse rounded-full bg-ink-700" />
            <div className="h-4 w-16 animate-pulse rounded bg-ink-700" />
          </div>
          <div className="h-4 w-24 animate-pulse rounded bg-ink-700" />
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
