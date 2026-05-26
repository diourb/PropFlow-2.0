"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="en">
      <body>
        <main className="flex min-h-screen items-center justify-center bg-background p-5 font-sans text-on-surface">
          <section className="w-full max-w-lg rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-error-container text-on-error-container">
              <AlertTriangle size={26} />
            </span>
            <p className="mt-6 text-xs font-bold uppercase tracking-wide text-error">
              Application error
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-primary">
              PropFlow needs a refresh
            </h1>
            <p className="mt-3 text-sm leading-6 text-on-surface-variant">
              The app shell could not load. Retry the request to recover the session.
            </p>
            <button
              className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary-container px-6 text-sm font-semibold text-on-primary"
              onClick={() => unstable_retry()}
              type="button"
            >
              <RefreshCw size={16} />
              Retry
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
