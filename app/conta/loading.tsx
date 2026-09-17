import { AppShellSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function ContaLoading() {
  return (
    <AppShellSkeleton>
      <div className="mx-auto flex max-w-lg flex-col gap-8 px-6 py-10">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-3 w-56" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-xl border border-ink-200 bg-paper-50 p-5">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </AppShellSkeleton>
  );
}
