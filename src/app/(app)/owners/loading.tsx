import { Skeleton, SectionCardSkeleton } from "@/components/app/skeleton";

export default function OwnersLoading() {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="mb-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-10 w-64 rounded-lg" />
          <Skeleton className="h-10 w-40 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCardSkeleton rows={6} />
        </div>
        <div className="space-y-6">
          <div className="rounded-xl border border-outline-variant/30 bg-surface p-6 shadow-sm">
            <Skeleton className="mb-4 h-6 w-40" />
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div className="flex items-center justify-between" key={i}>
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
