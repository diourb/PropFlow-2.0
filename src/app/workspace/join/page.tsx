import Link from "next/link";
import { redirect } from "next/navigation";
import { joinWorkspace } from "@/app/actions";

async function joinWorkspaceAndContinue(formData: FormData) {
  "use server";
  await joinWorkspace(formData);
  redirect("/dashboard");
}

export default function JoinWorkspacePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-5">
      <section className="w-full max-w-md rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-8 ambient-shadow">
        <h1 className="font-heading text-3xl font-semibold text-primary">
          Join Workspace
        </h1>
        <p className="mt-2 text-sm leading-6 text-on-surface-variant">
          Enter the invite code from your workspace administrator.
        </p>
        <form action={joinWorkspaceAndContinue} className="mt-8 space-y-5">
          <input
            className="h-12 w-full rounded-lg border border-outline-variant px-4 font-semibold uppercase tracking-widest outline-none focus:border-secondary"
            name="inviteCode"
            placeholder="PF-INVITE"
            required
          />
          <button className="h-11 w-full rounded-lg bg-primary-container text-sm font-semibold text-on-primary">
            Join Workspace
          </button>
        </form>
        <Link className="mt-6 block text-center text-sm font-semibold text-on-surface-variant" href="/workspace">
          Back to options
        </Link>
      </section>
    </main>
  );
}
