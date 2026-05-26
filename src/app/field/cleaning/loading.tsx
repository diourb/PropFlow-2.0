import { Skeleton, SectionCardSkeleton } from "@/components/app/skeleton";

export default function FieldCleaningLoading() {
  return (
    <div className="animate-in fade-in duration-500 pb-24">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
      </div>

      <Skeleton className="mb-6 h-56 w-full rounded-xl" />

      <SectionCardSkeleton rows={8} />
    </div>
  );
}
