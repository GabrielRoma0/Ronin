import { AppShellSkeleton } from "@/components/ui/Skeleton";
import { ImportarPageSkeleton } from "@/components/importar/ImportarPageSkeleton";

export default function CaixaLoading() {
  return (
    <AppShellSkeleton>
      <ImportarPageSkeleton />
    </AppShellSkeleton>
  );
}
