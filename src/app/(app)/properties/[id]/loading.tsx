import { Skeleton, SectionCardSkeleton } from "@/components/app/skeleton";

export default function PropertyDetailLoading() {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-4 flex items-center gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-11 w-32 rounded-lg" />
          <Skeleton className="h-11 w-24 rounded-lg" />
        </div>
      </div>

      <Skeleton className="mb-8 h-72 w-full rounded-xl md:h-[340px]" />

      <div className="mb-8 flex gap-6 border-b border-outline-variant pb-px">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton className="h-10 w-20" key={i} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton className="h-24 rounded-xl" key={i} />
            ))}
          </div>
          <SectionCardSkeleton rows={4} />
        </div>
        <div className="space-y-6 lg:col-span-4">
          <SectionCardSkeleton rows={2} />
          <SectionCardSkeleton rows={3} />
        </div>
      </div>
    </div>
  );
}
