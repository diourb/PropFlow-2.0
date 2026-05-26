import { Skeleton, SectionCardSkeleton, StatCardSkeleton } from "@/components/app/skeleton";

export default function OwnerPortalLoading() {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-11 w-32 rounded-lg" />
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCardSkeleton rows={3} />
        <SectionCardSkeleton rows={3} />
        <SectionCardSkeleton rows={3} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <SectionCardSkeleton rows={5} />
        <SectionCardSkeleton rows={5} />
      </div>
    </div>
  );
}
