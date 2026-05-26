import { Skeleton, SectionCardSkeleton } from "@/components/app/skeleton";

export default function NotificationsLoading() {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="max-w-4xl mx-auto">
        <SectionCardSkeleton rows={10} />
      </div>
    </div>
  );
}
