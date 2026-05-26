import { Skeleton, SectionCardSkeleton, StatCardSkeleton } from "@/components/app/skeleton";

export default function ReportsLoading() {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="mb-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-10 w-48 rounded-lg" />
          <Skeleton className="h-10 w-40 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCardSkeleton rows={8} />
        </div>
        <SectionCardSkeleton rows={8} />
      </div>
    </div>
  );
}
