import { Skeleton, SectionCardSkeleton, StatCardSkeleton } from "@/components/app/skeleton";

export default function AdminLoading() {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      <div className="mt-8">
        <SectionCardSkeleton rows={8} />
      </div>
    </div>
  );
}
