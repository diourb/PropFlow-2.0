import { Skeleton, SectionCardSkeleton } from "@/components/app/skeleton";

export default function CleanerDashboardLoading() {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>

      <Skeleton className="mb-6 h-56 w-full rounded-xl" />

      <SectionCardSkeleton rows={6} />
    </div>
  );
}
