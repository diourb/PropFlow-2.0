import Link from "next/link";
import { Ban, Mail } from "lucide-react";

export default function SuspendedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-5 text-on-surface">
      <section className="w-full max-w-lg rounded-xl border border-error/20 bg-surface-container-lowest p-8 text-center ambient-shadow">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-error-container text-on-error-container">
          <Ban size={26} />
        </span>
        <h1 className="mt-6 font-heading text-3xl font-semibold text-primary">
          Workspace access suspended
        </h1>
        <p className="mt-3 text-sm leading-6 text-on-surface-variant">
          This account cannot access PropFlow operations right now. Contact your
          workspace owner or PropFlow support to restore access.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            className="flex h-11 flex-1 items-center justify-center rounded-lg border border-outline-variant text-sm font-semibold"
            href="/login"
          >
            Back to login
          </Link>
          <a
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-primary-container text-sm font-semibold text-on-primary"
            href="mailto:support@propflow.local"
          >
            <Mail size={16} />
            Contact support
          </a>
        </div>
      </section>
    </main>
  );
}
