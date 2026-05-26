import { Skeleton } from "@/components/app/skeleton";

export default function BookingsLoading() {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-[500px]" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-11 w-32 rounded-lg" />
          <Skeleton className="h-11 w-36 rounded-lg" />
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="bg-surface-container-low">
              <tr>
                {Array.from({ length: 8 }).map((_, i) => (
                  <th className="px-4 py-3" key={i}>
                    <Skeleton className="h-4 w-20" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50">
              {Array.from({ length: 10 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4"><Skeleton className="h-4 w-32" /></td>
                  <td className="px-4 py-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </td>
                  <td className="px-4 py-4"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-4 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                  <td className="px-4 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                  <td className="px-4 py-4"><Skeleton className="h-4 w-16" /></td>
                  <td className="px-4 py-4"><Skeleton className="h-8 w-8" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
