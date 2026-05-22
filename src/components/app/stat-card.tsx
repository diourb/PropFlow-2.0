import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  tone = "secondary",
}: {
  label: string;
  value: string;
  delta: string;
  icon?: LucideIcon;
  tone?: "secondary" | "primary" | "error" | "neutral";
}) {
  const iconClass =
    tone === "error"
      ? "text-error bg-error/10"
      : tone === "primary"
        ? "text-primary-container bg-primary-container/10"
        : tone === "neutral"
          ? "text-outline bg-surface-container-high"
          : "text-secondary bg-secondary/10";

  return (
    <div className="flex min-h-[126px] flex-col justify-between rounded-lg border border-outline-variant/35 bg-surface-container-lowest p-4 ambient-shadow">
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
          {label}
        </span>
        {Icon ? (
          <span className={`rounded-full p-2 ${iconClass}`}>
            <Icon size={18} />
          </span>
        ) : null}
      </div>
      <div>
        <div className="font-heading text-3xl font-semibold text-primary-container">
          {value}
        </div>
        <p className="mt-1 text-xs font-semibold text-secondary">{delta}</p>
      </div>
    </div>
  );
}
