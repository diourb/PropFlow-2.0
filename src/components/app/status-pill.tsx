import { cn } from "@/lib/utils";

const toneMap = {
  success: "bg-secondary/10 text-secondary border-secondary/20",
  danger: "bg-error-container text-on-error-container border-error/20",
  info: "bg-primary-fixed text-on-primary-fixed border-primary-fixed-dim",
  neutral: "bg-surface-container-high text-on-surface-variant border-outline-variant/40",
  dark: "bg-primary-container text-on-primary border-primary-container",
};

export function StatusPill({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof toneMap;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        toneMap[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
