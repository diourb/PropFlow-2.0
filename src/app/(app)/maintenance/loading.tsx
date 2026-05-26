import { Skeleton } from "@/components/app/skeleton";

export default function MaintenanceLoading() {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-40" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-40 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-full" />
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-error/20 bg-error-container/20 p-4">
        <Skeleton className="h-7 w-48 mb-4" />
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div className="rounded-lg bg-surface-container-lowest p-4 space-y-2" key={i}>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      </div>

      <div className="hidden gap-4 overflow-x-auto pb-6 md:flex">
        {Array.from({ length: 4 }).map((_, i) => (
          <section className="w-[300px] shrink-0" key={i}>
            <div className="mb-4 flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-5 w-8 rounded-full" />
            </div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, j) => (
                <article className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4" key={j}>
                  <div className="flex justify-between gap-2">
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-5 w-40" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                  <Skeleton className="mt-3 h-12 w-full" />
                  <div className="mt-4 flex items-center justify-between border-t border-outline-variant/40 pt-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <div className="mt-3 flex gap-1.5">
                    <Skeleton className="h-8 flex-1 rounded" />
                    <Skeleton className="h-8 flex-1 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
