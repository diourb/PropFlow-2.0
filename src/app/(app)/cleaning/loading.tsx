import { Skeleton } from "@/components/app/skeleton";

export default function CleaningLoading() {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-48 rounded-lg" />
          <Skeleton className="h-10 w-40 rounded-lg" />
        </div>
      </div>

      <div className="grid gap-6">
        <div className="overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest">
          <Skeleton className="h-56 w-full" />
          <div className="p-6">
            <div className="flex justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="text-right space-y-1">
                <Skeleton className="h-5 w-20 ml-auto" />
                <Skeleton className="h-4 w-24 ml-auto" />
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <Skeleton className="h-11 flex-1 rounded-lg" />
              <Skeleton className="h-11 w-12 rounded-lg" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-5">
          <div className="mb-5 flex items-end justify-between">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="mb-3 h-4 w-20" />
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <Skeleton className="h-14 w-full rounded-lg" key={j} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
