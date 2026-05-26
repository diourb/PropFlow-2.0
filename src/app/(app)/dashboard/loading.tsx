import {
  StatCardSkeleton,
  SectionCardSkeleton,
  Skeleton,
} from "@/components/app/skeleton";

export default function DashboardLoading() {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-96" />
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
        <SectionCardSkeleton rows={4} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <SectionCardSkeleton rows={5} />
        <SectionCardSkeleton rows={5} />
      </div>
    </div>
  );
}
