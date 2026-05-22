import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-5 text-on-surface">
      <section className="w-full max-w-lg rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center ambient-shadow">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
          <Compass size={26} />
        </span>
        <p className="mt-6 text-xs font-bold uppercase tracking-wide text-secondary">
          404
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold text-primary">
          Page not found
        </h1>
        <p className="mt-3 text-sm leading-6 text-on-surface-variant">
          This route is not part of the current PropFlow workspace experience.
        </p>
        <Link
          className="mt-8 inline-flex h-11 items-center justify-center rounded-lg bg-primary-container px-6 text-sm font-semibold text-on-primary"
          href="/dashboard"
        >
          Back to dashboard
        </Link>
      </section>
    </main>
  );
}
