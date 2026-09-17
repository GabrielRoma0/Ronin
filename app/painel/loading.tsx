import { AppShellSkeleton, Skeleton } from "@/components/ui/Skeleton";

/**
 * `/painel` faz ~15 consultas ao Supabase em paralelo (dashboard, 6 meses de
 * histórico, uma por conta bancária, funcionários, sócios, CMV…) antes do
 * Server Component ter qualquer HTML pra mandar — sem essa tela, a página
 * fica em branco até tudo resolver. Formato antecipa Dashboard (o que mais
 * gente vê primeiro): nav lateral + 4 cards de KPI.
 */
export default function PainelLoading() {
  return (
    <AppShellSkeleton>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-10 w-44 rounded-xl" />
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <aside className="hidden shrink-0 lg:block lg:w-60">
            <div className="flex flex-col gap-2 rounded-xl border border-ink-200 bg-paper-50 p-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </aside>

          <div className="grid min-w-0 flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3 rounded-2xl border border-ink-200 bg-paper-50 p-5">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
                <Skeleton className="h-7 w-28" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShellSkeleton>
  );
}
