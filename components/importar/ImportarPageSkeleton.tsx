import { Skeleton } from "@/components/ui/Skeleton";

/** Formato compartilhado por app/caixa/loading.tsx e app/painel/importar/loading.tsx — ambas as rotas renderizam ImportarPage. */
export function ImportarPageSkeleton() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-wrap gap-2 border-b border-ink-200 pb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-28" />
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-8 w-56" />
      </div>
      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-ink-200 bg-paper-50 p-4">
        <Skeleton className="h-10 w-40 rounded-lg" />
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>
    </div>
  );
}
