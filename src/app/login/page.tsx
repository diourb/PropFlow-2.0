import Link from "next/link";
import { Building2 } from "lucide-react";
import { signInWithGoogle, signInWithPassword, signUpWithPassword } from "@/app/actions";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; forgot?: string }>;
}) {
  const params = await searchParams;
  const isSupabase = hasSupabaseEnv();
  const showForgot = params.forgot === "1";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#dae2fd_0,transparent_35%),radial-gradient(circle_at_bottom_left,#eaedff_0,transparent_30%)] opacity-70" />
      <section className="relative w-full max-w-md rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-8 ambient-shadow md:p-12">
        <div className="mb-10 flex flex-col items-center text-center">
          <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-container text-on-primary">
            <Building2 size={24} />
          </span>
          <h1 className="font-heading text-3xl font-semibold text-primary">
            PropFlow
          </h1>
          <p className="mt-2 text-on-surface-variant">Management Portal</p>
        </div>

        {params.error ? (
          <div className="mb-6 rounded-lg bg-error-container px-4 py-3 text-sm font-semibold text-on-error-container">
            {decodeURIComponent(params.error)}
          </div>
        ) : null}

        {showForgot ? (
          <div className="mb-6 rounded-lg bg-secondary-container px-4 py-3 text-sm font-semibold text-on-secondary-container">
            Password reset is not available in demo mode. Contact your workspace admin to reset your credentials.
          </div>
        ) : null}

        <form action={signInWithPassword} className="space-y-6">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-on-surface">
              Email Address
            </span>
            <input
              className="h-11 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 text-sm outline-none focus:border-secondary"
              name="email"
              placeholder="name@company.com"
              type="email"
            />
          </label>
          <label className="block">
            <span className="mb-2 flex justify-between text-xs font-semibold text-on-surface">
              Password
              <Link className="text-primary hover:text-secondary" href="/login?forgot=1">
                Forgot Password?
              </Link>
            </span>
            <input
              className="h-11 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 text-sm outline-none focus:border-secondary"
              name="password"
              placeholder="********"
              type="password"
            />
          </label>
          {!isSupabase ? (
            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-on-surface">
                Demo persona
              </span>
              <select
                className="h-11 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 text-sm outline-none focus:border-secondary"
                defaultValue="workspace_admin"
                name="role"
              >
                <option value="workspace_admin">Workspace Admin / Host</option>
                <option value="manager">Manager / Host</option>
                <option value="owner">Owner</option>
                <option value="cleaner">Cleaner</option>
                <option value="maintenance_tech">Maintenance Tech</option>
                <option value="guest">Guest</option>
              </select>
            </label>
          ) : null}
          <button className="flex h-11 w-full items-center justify-center rounded-lg bg-primary-container text-sm font-semibold text-on-primary">
            Log In
          </button>
        </form>
        {!isSupabase && (
          <form action={signUpWithPassword} className="mt-3 grid grid-cols-2 gap-3">
            <input name="email" type="hidden" value="demo@propflow.local" />
            <input name="password" type="hidden" value="propflow-demo" />
            <input name="fullName" type="hidden" value="Demo Workspace Admin" />
            <button className="col-span-2 h-10 rounded-lg border border-outline-variant text-sm font-semibold text-primary">
              Create demo admin account
            </button>
          </form>
        )}
        <div className="my-8 flex items-center gap-3">
          <span className="h-px flex-1 bg-outline-variant" />
          <span className="text-xs font-semibold text-outline">
            Or continue with
          </span>
          <span className="h-px flex-1 bg-outline-variant" />
        </div>
        <form action={signInWithGoogle}>
          <button className="flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm font-semibold text-on-surface hover:bg-surface-container-low">
            Login with Google
          </button>
        </form>
        <p className="mt-8 text-center text-sm text-on-surface-variant">
          Don&apos;t have an account?{" "}
          <Link className="font-semibold text-primary hover:text-secondary" href="/workspace">
            Sign up
          </Link>
        </p>
      </section>
    </main>
  );
}
