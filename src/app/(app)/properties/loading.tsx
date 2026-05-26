import { Skeleton } from "@/components/app/skeleton";

export default function PropertiesLoading() {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-11 w-32 rounded-lg" />
      </div>

      <div className="mb-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            className="overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest"
            key={i}
          >
            <Skeleton className="h-52 w-full" />
            <div className="p-6">
              <div className="mb-2 flex items-start justify-between gap-3">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="mb-5 h-4 w-32" />
              <div className="border-t border-outline-variant/40 pt-4">
                <Skeleton className="mb-3 h-3 w-24" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 w-9" />
                  <Skeleton className="h-9 w-9" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
