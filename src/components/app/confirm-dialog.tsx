"use client";

import { useTransition } from "react";
import { AlertTriangle, X } from "lucide-react";

type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  onCancel,
  onConfirm,
}: Props) {
  const [isPending, startTransition] = useTransition();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-background/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-xl border border-outline-variant bg-surface p-6 ambient-shadow">
        <div className="mb-4 flex items-start justify-between gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-error-container text-on-error-container">
            <AlertTriangle size={20} />
          </span>
          <button
            aria-label="Cancel"
            className="ml-auto rounded-full p-1 text-on-surface-variant hover:bg-surface-container"
            onClick={onCancel}
          >
            <X size={18} />
          </button>
        </div>
        <h2 className="font-heading text-xl font-semibold text-on-surface">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-on-surface-variant">{description}</p>
        <div className="mt-6 flex gap-3">
          <button
            className="h-10 flex-1 rounded-lg border border-outline-variant text-sm font-semibold hover:bg-surface-container-low"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className="h-10 flex-1 rounded-lg bg-error text-sm font-semibold text-on-error disabled:opacity-60"
            disabled={isPending}
            onClick={() => startTransition(async () => { await onConfirm(); })}
            type="button"
          >
            {isPending ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
