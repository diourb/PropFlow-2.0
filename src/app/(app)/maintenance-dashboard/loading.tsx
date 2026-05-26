import { Skeleton, SectionCardSkeleton } from "@/components/app/skeleton";

export default function MaintenanceDashboardLoading() {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-9 w-60" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-40" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-36 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-full" />
        </div>
      </div>

      <SectionCardSkeleton rows={5} />
      <div className="mt-4">
        <SectionCardSkeleton rows={5} />
      </div>
    </div>
  );
}
