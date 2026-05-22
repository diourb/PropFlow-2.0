import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6 text-center">
      <div className="max-w-md rounded-xl border border-outline-variant bg-surface-container-lowest p-8 ambient-shadow">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-container text-on-primary">
          PF
        </div>
        <h1 className="font-heading text-2xl font-semibold text-primary">
          You are offline
        </h1>
        <p className="mt-3 text-sm leading-6 text-on-surface-variant">
          PropFlow can reopen cached pages, but live tasks, reports, and sync
          actions need a network connection.
        </p>
        <Link
          className="mt-6 inline-flex h-11 items-center rounded-lg bg-primary-container px-5 text-sm font-semibold text-on-primary"
          href="/dashboard"
        >
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
