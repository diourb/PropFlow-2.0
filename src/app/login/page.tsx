import Link from "next/link";
import { Building2, CheckCircle2 } from "lucide-react";
import { signInWithGoogle, signInWithPassword, signUpWithPassword } from "@/app/actions";
import { hasSupabaseEnv } from "@/lib/supabase/env";

const highlights = [
  "Bookings, leases, cleaning & maintenance in one place",
  "Role-aware portals for every stakeholder",
  "Owner statements, CSV exports, and push notifications",
  "Field team PWA — works on any device, offline-ready",
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; forgot?: string; next?: string }>;
}) {
  const params = await searchParams;
  const isSupabase = hasSupabaseEnv();
  const showForgot = params.forgot === "1";

  return (
    <main className="flex min-h-screen bg-background">
      {/* Left panel — marketing */}
      <div className="hidden flex-col justify-between bg-primary-container p-12 text-on-primary lg:flex lg:w-[480px] xl:w-[520px]">
        <div>
          <Link className="flex items-center gap-2.5" href="/">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-on-secondary">
              <Building2 size={20} />
            </span>
            <span className="font-heading text-2xl font-bold">PropFlow</span>
          </Link>
        </div>

        <div>
          <blockquote className="mb-8">
            <p className="font-heading text-3xl font-semibold leading-snug">
              &ldquo;We replaced three separate tools with PropFlow in a single weekend.&rdquo;
            </p>
            <footer className="mt-5 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-sm font-bold text-on-secondary">RC</span>
              <div>
                <p className="font-semibold">Rebecca Cole</p>
                <p className="text-sm text-on-primary/70">Portfolio Director, Apex Properties</p>
              </div>
            </footer>
          </blockquote>

          <ul className="space-y-3">
            {highlights.map((h) => (
              <li key={h} className="flex items-start gap-3 text-sm text-on-primary/80">
                <CheckCircle2 className="mt-0.5 shrink-0 text-secondary-fixed" size={17} />
                {h}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-on-primary/50">© {new Date().getFullYear()} PropFlow · All rights reserved</p>
      </div>

      {/* Right panel — form */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden p-6">
        <div className="pointer-events-none absolute right-[-12rem] top-[-10rem] h-80 w-80 rounded-full bg-secondary-container/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-12rem] left-[-10rem] h-80 w-80 rounded-full bg-primary-fixed/20 blur-3xl" />

        <section className="relative w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex flex-col items-center text-center lg:hidden">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-container text-on-primary">
              <Building2 size={24} />
            </span>
            <h1 className="font-heading text-2xl font-bold text-primary">PropFlow</h1>
            <p className="text-sm text-on-surface-variant">Management Portal</p>
          </div>

          <div className="mb-8 hidden lg:block">
            <h2 className="font-heading text-3xl font-semibold text-primary">Welcome back</h2>
            <p className="mt-1 text-on-surface-variant">Sign in to your workspace</p>
          </div>

          {params.error ? (
            <div className="mb-5 rounded-xl border border-error/30 bg-error-container px-4 py-3 text-sm font-semibold text-on-error-container">
              {decodeURIComponent(params.error)}
            </div>
          ) : null}

          {showForgot ? (
            <div className="mb-5 rounded-xl border border-secondary/30 bg-secondary-container px-4 py-3 text-sm font-semibold text-on-secondary-container">
              Password reset is not available in demo mode. Contact your workspace admin to reset credentials.
            </div>
          ) : null}

          {!isSupabase ? (
            <div className="mb-5 rounded-xl border border-secondary/20 bg-secondary/10 px-4 py-3 text-xs font-semibold text-on-secondary-container">
              Demo mode active — use any credentials or pick a persona below to sign in instantly.
            </div>
          ) : null}

          <form action={signInWithPassword} className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-xs font-bold text-on-surface">Email Address</span>
              <input
                autoComplete="email"
                className="h-12 w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 text-sm outline-none transition focus:border-secondary focus:ring-1 focus:ring-secondary/30"
                name="email"
                placeholder="name@company.com"
                type="email"
              />
            </label>
            <label className="block">
              <span className="mb-2 flex items-center justify-between text-xs font-bold text-on-surface">
                Password
                <Link className="font-semibold text-primary hover:text-secondary" href="/login?forgot=1">
                  Forgot password?
                </Link>
              </span>
              <input
                autoComplete="current-password"
                className="h-12 w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 text-sm outline-none transition focus:border-secondary focus:ring-1 focus:ring-secondary/30"
                name="password"
                placeholder="••••••••"
                type="password"
              />
            </label>
            {!isSupabase ? (
              <label className="block">
                <span className="mb-2 block text-xs font-bold text-on-surface">Demo persona</span>
                <select
                  className="h-12 w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 text-sm outline-none transition focus:border-secondary"
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
            <button className="flex h-12 w-full items-center justify-center rounded-xl bg-primary-container text-sm font-bold text-on-primary transition hover:bg-primary">
              Sign In
            </button>
          </form>

          {!isSupabase ? (
            <form action={signUpWithPassword} className="mt-3">
              <input name="email" type="hidden" value="demo@propflow.local" />
              <input name="password" type="hidden" value="propflow-demo" />
              <input name="fullName" type="hidden" value="Demo Workspace Admin" />
              <button className="h-11 w-full rounded-xl border border-outline-variant text-sm font-semibold text-primary transition hover:bg-surface-container-low">
                Create demo account
              </button>
            </form>
          ) : null}

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-outline-variant/60" />
            <span className="text-xs font-semibold text-outline">or</span>
            <span className="h-px flex-1 bg-outline-variant/60" />
          </div>

          <form action={signInWithGoogle}>
            <button className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest text-sm font-semibold text-on-surface transition hover:bg-surface-container-low">
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-on-surface-variant">
            No account yet?{" "}
            <Link className="font-bold text-primary hover:text-secondary" href="/workspace">
              Create a free workspace
            </Link>
          </p>

          <p className="mt-3 text-center">
            <Link className="text-xs text-on-surface-variant hover:text-primary" href="/">
              ← Back to propflow.io
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
