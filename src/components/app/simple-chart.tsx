const bars = [
  { label: "Jan", projected: 40, actual: 62 },
  { label: "Feb", projected: 55, actual: 70 },
  { label: "Mar", projected: 36, actual: 52 },
  { label: "Apr", projected: 78, actual: 96 },
  { label: "May", projected: 65, actual: 88 },
  { label: "Jun", projected: 45, actual: 66 },
];

export function RevenueChart() {
  return (
    <div className="flex min-h-[320px] flex-col">
      <div className="flex flex-1 items-end gap-4 rounded-lg border border-outline-variant/30 bg-surface-container-low p-5">
        {bars.map((bar) => (
          <div key={bar.label} className="flex h-full flex-1 flex-col justify-end">
            <div className="flex h-56 items-end gap-1">
              <div
                className="w-full rounded-t bg-primary-container"
                style={{ height: `${bar.projected}%` }}
              />
              <div
                className="w-full rounded-t bg-secondary"
                style={{ height: `${bar.actual}%` }}
              />
            </div>
            <div className="mt-3 text-center text-xs font-semibold text-on-surface-variant">
              {bar.label}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-center gap-6 text-xs font-semibold text-on-surface-variant">
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-primary-container" />
          Projected
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-secondary" />
          Actual
        </span>
      </div>
    </div>
  );
}

export function DonutBreakdown() {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <div
        className="relative h-48 w-48 rounded-full border-[18px] border-primary-container"
        style={{
          borderRightColor: "#006a60",
          borderBottomColor: "#89f5e5",
          borderLeftColor: "#c4c6cf",
          transform: "rotate(-45deg)",
        }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center rounded-full bg-surface-container-lowest"
          style={{ transform: "rotate(45deg)" }}
        >
          <div className="text-center">
            <div className="font-heading text-2xl font-semibold text-primary">
              $38.2k
            </div>
            <div className="text-xs font-semibold uppercase text-outline">
              Total
            </div>
          </div>
        </div>
      </div>
      <div className="w-full space-y-3 text-sm">
        {[
          ["Maintenance", "45%", "bg-primary-container"],
          ["Cleaning", "30%", "bg-secondary"],
          ["Utilities", "15%", "bg-secondary-fixed"],
          ["Other", "10%", "bg-outline-variant"],
        ].map(([label, value, color]) => (
          <div className="flex items-center justify-between" key={label}>
            <span className="inline-flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
              {label}
            </span>
            <span className="font-semibold">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
