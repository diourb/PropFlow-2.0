import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-surface-dim", className)}
      {...props}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-outline-variant/30 bg-surface p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="mt-4 h-8 w-32" />
      <Skeleton className="mt-2 h-3 w-40" />
    </div>
  );
}

export function SectionCardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-outline-variant/30 bg-surface p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div className="flex items-center justify-between gap-4 py-2" key={i}>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
