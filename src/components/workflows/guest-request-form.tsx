"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { MessageCircle, Wrench, X } from "lucide-react";
import { createGuestMaintenanceRequest } from "@/app/actions";

export function GuestRequestForm({ property }: { property?: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-3">
      <button
        className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-secondary text-sm font-semibold text-on-secondary"
        aria-expanded={open}
        disabled={!mounted}
        onClick={() => {
          setOpen(true);
          setMessage("");
        }}
        type="button"
      >
        <Wrench size={17} />
        Maintenance Request
      </button>
      <button
        className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-outline-variant text-sm font-semibold"
        disabled={!mounted}
        onClick={() => {
          setOpen(true);
          setMessage("Use the form below and the manager will receive it.");
        }}
        type="button"
      >
        <MessageCircle size={17} />
        Contact Manager
      </button>
      {open ? (
        <form
          className="rounded-lg border border-outline-variant/50 bg-surface-container-low p-4"
          onSubmit={(event) => {
            event.preventDefault();
            const form = formRef.current;
            if (!form) return;
            startTransition(async () => {
              const result = await createGuestMaintenanceRequest(new FormData(form));
              setMessage(result.message);
              if (result.ok) form.reset();
            });
          }}
          ref={formRef}
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-primary">Request details</p>
            <button
              aria-label="Close request form"
              className="rounded p-1 text-on-surface-variant hover:bg-surface-container-high"
              onClick={() => setOpen(false)}
              type="button"
            >
              <X size={16} />
            </button>
          </div>
          <input name="property" type="hidden" value={property ?? ""} />
          <label className="mb-3 block">
            <span className="mb-1 block text-xs font-semibold text-on-surface-variant">
              Request title
            </span>
            <input
              className="h-10 w-full rounded-lg border border-outline-variant bg-surface px-3 text-sm"
              name="title"
              placeholder="Leaky faucet"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-on-surface-variant">
              Details
            </span>
            <textarea
              className="min-h-24 w-full rounded-lg border border-outline-variant bg-surface p-3 text-sm"
              name="description"
              placeholder="Tell us what needs attention."
              required
            />
          </label>
          {message ? (
            <p className="mt-3 rounded bg-secondary-container px-3 py-2 text-xs font-semibold text-on-secondary-container">
              {message}
            </p>
          ) : null}
          <button
            className="mt-4 h-10 w-full rounded-lg bg-primary-container text-sm font-semibold text-on-primary disabled:opacity-60"
            disabled={isPending}
          >
            {isPending ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
