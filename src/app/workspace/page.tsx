import Link from "next/link";
import { Building2, LogOut, Users } from "lucide-react";

export default function WorkspaceChoicePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-5">
      <div className="w-full max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="font-heading text-5xl font-bold text-primary">
            Welcome to PropFlow
          </h1>
          <p className="mt-4 text-lg text-on-surface-variant">
            Choose how you want to start managing your property operations.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Link
            className="group rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-left ambient-shadow transition hover:border-secondary"
            href="/workspace/new"
          >
            <span className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-high text-primary transition group-hover:bg-secondary group-hover:text-on-secondary">
              <Building2 size={30} />
            </span>
            <h2 className="font-heading text-2xl font-semibold text-primary">
              Create New Workspace
            </h2>
            <p className="mt-3 text-on-surface-variant">
              Set up a new organization for properties, owners, team members,
              bookings, leases, and operations.
            </p>
          </Link>
          <Link
            className="group rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-left ambient-shadow transition hover:border-secondary"
            href="/workspace/join"
          >
            <span className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-high text-primary transition group-hover:bg-secondary group-hover:text-on-secondary">
              <Users size={30} />
            </span>
            <h2 className="font-heading text-2xl font-semibold text-primary">
              Join Existing
            </h2>
            <p className="mt-3 text-on-surface-variant">
              Use an invite code from your team to join a workspace with scoped
              role permissions.
            </p>
          </Link>
        </div>
        <div className="mt-10 text-center">
          <Link
            className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-primary"
            href="/login"
          >
            <LogOut size={16} />
            Sign out
          </Link>
        </div>
      </div>
    </main>
  );
}
