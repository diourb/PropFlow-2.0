import { Skeleton, SectionCardSkeleton } from "@/components/app/skeleton";

export default function GuestPortalLoading() {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-9 w-44" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCardSkeleton rows={3} />
        </div>
        <SectionCardSkeleton rows={4} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <SectionCardSkeleton rows={4} />
        <SectionCardSkeleton rows={4} />
      </div>
    </div>
  );
}
