import { cn } from "@/lib/utils";

export function SectionCard({
  title,
  action,
  children,
  className,
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "scroll-mt-28 rounded-xl border border-outline-variant/35 bg-surface-container-lowest ambient-shadow",
        className,
      )}
    >
      {title || action ? (
        <div className="flex flex-col items-start justify-between gap-4 border-b border-outline-variant/30 px-5 py-4 sm:flex-row sm:items-center">
          {title ? (
            <h2 className="font-heading text-xl font-semibold text-primary">
              {title}
            </h2>
          ) : (
            <span />
          )}
          {action ? <div className="w-full sm:w-auto">{action}</div> : null}
        </div>
      ) : null}
      <div className="p-5">{children}</div>
    </section>
  );
}
