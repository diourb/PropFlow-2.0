import { Skeleton, SectionCardSkeleton } from "@/components/app/skeleton";

export default function WorkspaceSettingsLoading() {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="mb-8 flex gap-8 border-b border-outline-variant">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton className="h-10 w-24" key={i} />
        ))}
      </div>

      <div className="grid gap-8 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SectionCardSkeleton rows={6} />
        </div>
        <div className="space-y-6">
          <div className="rounded-xl bg-primary-container/20 p-6">
            <Skeleton className="h-4 w-24 mb-4" />
            <Skeleton className="h-8 w-40 mb-8" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
            <Skeleton className="h-10 w-full mt-8 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
