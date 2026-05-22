export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        {eyebrow ? (
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-secondary">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-heading text-3xl font-semibold text-primary md:text-[32px]">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant md:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
