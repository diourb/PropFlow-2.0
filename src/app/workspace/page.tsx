import Link from "next/link";
import { ArrowRight, Building2, LogIn, Users } from "lucide-react";

export default function WorkspaceChoicePage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-5">
      <div className="pointer-events-none absolute right-[-14rem] top-[-12rem] h-96 w-96 rounded-full bg-secondary-container/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-14rem] left-[-12rem] h-96 w-96 rounded-full bg-primary-fixed/20 blur-3xl" />

      <div className="relative w-full max-w-3xl">
        <div className="mb-12 text-center">
          <Link className="mb-6 inline-flex items-center gap-2.5" href="/">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container text-on-primary">
              <Building2 size={22} />
            </span>
            <span className="font-heading text-2xl font-bold text-primary">PropFlow</span>
          </Link>
          <h1 className="font-heading text-4xl font-bold text-primary md:text-5xl">
            Get started in seconds
          </h1>
          <p className="mt-4 text-lg text-on-surface-variant">
            Create a new workspace or join your team&apos;s existing one.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Link
            className="group flex flex-col rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-8 ambient-shadow transition hover:border-secondary/50 hover:-translate-y-0.5"
            href="/workspace/new"
          >
            <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary-container/30 text-on-primary transition group-hover:bg-primary-container">
              <Building2 size={26} />
            </span>
            <h2 className="mb-2 font-heading text-xl font-semibold text-primary">Create Workspace</h2>
            <p className="flex-1 text-sm leading-7 text-on-surface-variant">
              Set up a new organization for your properties, owners, team members, bookings, and operations.
            </p>
            <div className="mt-6 flex items-center gap-2 text-sm font-bold text-primary">
              Get started free <ArrowRight size={16} />
            </div>
          </Link>

          <Link
            className="group flex flex-col rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-8 ambient-shadow transition hover:border-secondary/50 hover:-translate-y-0.5"
            href="/workspace/join"
          >
            <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-surface-container-high text-on-surface-variant transition group-hover:bg-secondary-container group-hover:text-on-secondary-container">
              <Users size={26} />
            </span>
            <h2 className="mb-2 font-heading text-xl font-semibold text-primary">Join a Workspace</h2>
            <p className="flex-1 text-sm leading-7 text-on-surface-variant">
              Use an invite code from your manager or team to join an existing workspace with the right role.
            </p>
            <div className="mt-6 flex items-center gap-2 text-sm font-bold text-primary">
              Enter invite code <ArrowRight size={16} />
            </div>
          </Link>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 text-sm text-on-surface-variant">
          <Link className="flex items-center gap-2 hover:text-primary" href="/login">
            <LogIn size={16} /> Already have an account? Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
