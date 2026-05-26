import { Skeleton, SectionCardSkeleton } from "@/components/app/skeleton";

export default function CalendarLoading() {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-11 w-32 rounded-lg" />
      </div>

      <div className="mb-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-10 w-48 rounded-lg" />
          <Skeleton className="h-10 w-40 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <SectionCardSkeleton rows={12} />
        <div className="space-y-6">
          <div className="rounded-xl border border-outline-variant/30 bg-surface p-6 shadow-sm">
            <Skeleton className="mb-4 h-6 w-32" />
            <div className="space-y-3">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>
          <div className="rounded-xl border border-outline-variant/30 bg-surface p-6 shadow-sm">
            <Skeleton className="mb-4 h-6 w-24" />
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div className="flex flex-col gap-1" key={i}>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
