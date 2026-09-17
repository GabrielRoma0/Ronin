import { AppShellSkeleton } from "@/components/ui/Skeleton";
import { ImportarPageSkeleton } from "@/components/importar/ImportarPageSkeleton";

export default function ImportarLoading() {
  return (
    <AppShellSkeleton>
      <ImportarPageSkeleton />
    </AppShellSkeleton>
  );
}
