import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, X } from "lucide-react";
import { createWorkspace } from "@/app/actions";

async function createWorkspaceAndContinue(formData: FormData) {
  "use server";
  await createWorkspace(formData);
  redirect("/onboarding");
}

export default function NewWorkspacePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-5">
      <section className="w-full max-w-2xl overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-lowest ambient-shadow">
        <header className="flex items-center justify-between border-b border-outline-variant/30 p-6">
          <div>
            <h1 className="font-heading text-2xl font-semibold text-primary">
              Create Workspace
            </h1>
            <p className="mt-1 text-sm text-on-surface-variant">
              Set up your property management environment.
            </p>
          </div>
          <Link className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container" href="/workspace">
            <X size={20} />
          </Link>
        </header>
        <div className="px-8 pt-6">
          <div className="grid grid-cols-3 gap-4 text-center text-xs font-semibold text-on-surface-variant">
            {["Details", "Type", "Region"].map((step, index) => (
              <div key={step}>
                <span className={`mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full ${index === 0 ? "bg-primary-container text-on-primary" : "bg-surface-container-high"}`}>
                  {index + 1}
                </span>
                {step}
              </div>
            ))}
          </div>
        </div>
        <form action={createWorkspaceAndContinue} className="space-y-6 p-8">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-on-surface">
              Business Name
            </span>
            <input
              className="h-12 w-full rounded-lg border border-outline-variant px-4 outline-none focus:border-secondary"
              name="name"
              placeholder="Apex Property Management"
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-on-surface">
              Portfolio Type
            </span>
            <select
              className="h-12 w-full rounded-lg border border-outline-variant px-4 outline-none focus:border-secondary"
              name="rentalModel"
              defaultValue="mixed"
            >
              <option value="mixed">Mixed rentals</option>
              <option value="short_term">Short-term rentals</option>
              <option value="long_term">Long-term rentals</option>
            </select>
          </label>
          <div className="flex justify-between border-t border-outline-variant/30 pt-6">
            <Link className="h-11 px-6 py-3 text-sm font-semibold text-on-surface-variant" href="/workspace">
              Back
            </Link>
            <button className="flex h-11 items-center gap-2 rounded-lg bg-primary-container px-8 text-sm font-semibold text-on-primary">
              Continue
              <ArrowRight size={17} />
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
