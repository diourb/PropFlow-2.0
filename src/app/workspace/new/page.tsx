import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Building2, CheckCircle2 } from "lucide-react";
import { createWorkspace } from "@/app/actions";

async function createWorkspaceAndContinue(formData: FormData) {
  "use server";
  await createWorkspace(formData);
  redirect("/onboarding");
}

export default function NewWorkspacePage() {
  return (
    <main className="flex min-h-screen bg-background">
      {/* Side panel */}
      <div className="hidden flex-col justify-between bg-primary-container p-12 text-on-primary lg:flex lg:w-[400px]">
        <div>
          <Link className="flex items-center gap-2.5" href="/">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-on-secondary">
              <Building2 size={20} />
            </span>
            <span className="font-heading text-2xl font-bold">PropFlow</span>
          </Link>
        </div>
        <div>
          <h2 className="mb-6 font-heading text-2xl font-semibold leading-snug">
            Your workspace is ready in under 2 minutes
          </h2>
          <ul className="space-y-4">
            {[
              "Add properties and start tracking bookings",
              "Invite cleaners, owners, and managers",
              "Generate owner statements automatically",
              "Full demo data available instantly",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-on-primary/80">
                <CheckCircle2 className="mt-0.5 shrink-0 text-secondary-fixed" size={16} />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-on-primary/50">No credit card required</p>
      </div>

      {/* Form */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden p-6">
        <div className="pointer-events-none absolute right-[-12rem] top-[-10rem] h-80 w-80 rounded-full bg-secondary-container/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-12rem] left-[-10rem] h-80 w-80 rounded-full bg-primary-fixed/20 blur-3xl" />

        <section className="relative w-full max-w-lg">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-container text-on-primary">
              <Building2 size={20} />
            </span>
            <span className="font-heading text-xl font-bold text-primary">PropFlow</span>
          </div>

          <div className="mb-8">
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-secondary">Step 1 of 2</p>
            <h1 className="font-heading text-3xl font-semibold text-primary">Create your workspace</h1>
            <p className="mt-2 text-on-surface-variant">
              Set up your property management environment in seconds.
            </p>
          </div>

          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-container text-xs font-bold text-on-primary">1</div>
            <div className="h-1 flex-1 rounded-full bg-primary-container/40" />
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-high text-xs font-semibold text-on-surface-variant">2</div>
          </div>

          <form action={createWorkspaceAndContinue} className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-xs font-bold text-on-surface">Business or Portfolio Name *</span>
              <input
                autoFocus
                className="h-12 w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 text-sm outline-none transition focus:border-secondary focus:ring-1 focus:ring-secondary/30"
                name="name"
                placeholder="Apex Property Management"
                required
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-bold text-on-surface">Portfolio Type</span>
              <select
                className="h-12 w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 text-sm outline-none transition focus:border-secondary"
                defaultValue="mixed"
                name="rentalModel"
              >
                <option value="mixed">Mixed (short-term + long-term rentals)</option>
                <option value="short_term">Short-term rentals only (Airbnb, VRBO, direct)</option>
                <option value="long_term">Long-term rentals only (leases, tenants)</option>
              </select>
            </label>

            <div className="flex items-center justify-between pt-2">
              <Link
                className="text-sm font-semibold text-on-surface-variant hover:text-primary"
                href="/workspace"
              >
                ← Back
              </Link>
              <button className="flex h-12 items-center gap-2 rounded-xl bg-primary-container px-8 text-sm font-bold text-on-primary transition hover:bg-primary">
                Continue <ArrowRight size={17} />
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-xs text-on-surface-variant">
            Already have an account?{" "}
            <Link className="font-bold text-primary hover:text-secondary" href="/login">
              Sign in
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
