"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-5 text-on-surface">
      <section className="w-full max-w-lg rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center ambient-shadow">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-error-container text-on-error-container">
          <AlertTriangle size={26} />
        </span>
        <p className="mt-6 text-xs font-bold uppercase tracking-wide text-error">
          Workspace error
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold text-primary">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm leading-6 text-on-surface-variant">
          PropFlow could not load this workspace view. Retry the request or return to the dashboard.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary-container px-6 text-sm font-semibold text-on-primary"
            onClick={() => unstable_retry()}
            type="button"
          >
            <RefreshCw size={16} />
            Retry
          </button>
          <Link
            className="inline-flex h-11 items-center justify-center rounded-lg border border-outline-variant px-6 text-sm font-semibold text-primary"
            href="/dashboard"
          >
            Back to dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
