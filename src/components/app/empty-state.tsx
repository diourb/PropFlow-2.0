import { LucideIcon } from "lucide-react";

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-outline-variant/50 bg-surface-container-low px-6 py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant">
        <Icon size={32} />
      </div>
      <h3 className="font-heading text-lg font-bold text-primary">{title}</h3>
      <p className="mt-2 max-w-[320px] text-sm text-on-surface-variant">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
