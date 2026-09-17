import { AppShellSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function PainelLogsLoading() {
  return (
    <AppShellSkeleton>
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-3 w-64" />
        </div>
        <div className="overflow-hidden rounded-xl border border-ink-200">
          <div className="border-b border-ink-200 bg-paper-50 px-4 py-2.5">
            <Skeleton className="h-3 w-full" />
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border-b border-ink-100 px-4 py-3 last:border-0">
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      </div>
    </AppShellSkeleton>
  );
}
