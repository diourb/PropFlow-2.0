import { Skeleton, SectionCardSkeleton } from "@/components/app/skeleton";

export default function AccountSettingsLoading() {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6">
          <div className="rounded-xl border border-outline-variant/30 bg-surface p-6 text-center">
            <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-surface-dim animate-pulse" />
            <Skeleton className="mx-auto mb-2 h-7 w-32" />
            <Skeleton className="mx-auto mb-3 h-4 w-40" />
            <Skeleton className="mx-auto h-6 w-24 rounded-full" />
          </div>
        </div>
        <div className="space-y-8 lg:col-span-2">
          <SectionCardSkeleton rows={4} />
          <SectionCardSkeleton rows={4} />
        </div>
      </div>
    </div>
  );
}
