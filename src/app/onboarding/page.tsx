"use client";

import Link from "next/link";
import { Building2, CheckCircle2, CreditCard, User, Users, Workflow } from "lucide-react";
import { useState } from "react";

const steps = [
  {
    id: "property",
    Icon: Building2,
    title: "Add your first property",
    description: "Create a listing to start managing units, bookings, maintenance, and owner reporting.",
    href: "/properties",
    cta: "Add Property",
  },
  {
    id: "team",
    Icon: Users,
    title: "Invite team members",
    description: "Collaborate with managers, owners, cleaners, maintenance staff, and leasing agents.",
    href: "/settings/workspace?tab=team",
    cta: "Invite Team",
  },
  {
    id: "billing",
    Icon: CreditCard,
    title: "Set up billing",
    description: "Connect PayPal subscriptions and configure plan limits.",
    href: "/settings/workspace?tab=billing",
    cta: "View Billing",
  },
  {
    id: "integrations",
    Icon: Workflow,
    title: "Sync platforms",
    description: "Connect channels, calendars, exports, and future accounting integrations.",
    href: "/settings/workspace?tab=integrations",
    cta: "View Integrations",
  },
  {
    id: "profile",
    Icon: User,
    title: "Complete profile",
    description: "Add company logo, contact details, and notification preferences.",
    href: "/settings/account",
    cta: "Edit Profile",
  },
];

export default function OnboardingPage() {
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }

  const progress = completed.size;
  const pct = Math.round((progress / steps.length) * 100);

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface p-5">
      <div className="w-full max-w-2xl">
        <header className="mb-10 text-center">
          <span className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container ambient-shadow">
            <CheckCircle2 size={34} />
          </span>
          <h1 className="font-heading text-5xl font-semibold text-primary">Workspace Ready</h1>
          <p className="mx-auto mt-4 max-w-lg text-lg leading-8 text-on-surface-variant">
            Get your mixed rental portfolio set up for success by completing a few quick steps.
          </p>
        </header>
        <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 ambient-shadow md:p-8">
          <div className="mb-8">
            <div className="mb-2 flex items-end justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">Setup Progress</span>
              <span className="font-heading text-xl font-semibold text-primary">{progress}/{steps.length}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-surface-container">
              <div
                className="h-full rounded-full bg-secondary transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            {progress === steps.length ? (
              <p className="mt-2 text-center text-sm font-semibold text-secondary">
                All steps complete — you&apos;re ready to launch! 🎉
              </p>
            ) : null}
          </div>
          <div className="space-y-3">
            {steps.map(({ id, Icon, title, description, href, cta }) => {
              const done = completed.has(id);
              return (
                <div
                  className={`flex gap-4 rounded-lg border p-4 transition ${done ? "border-secondary/30 bg-secondary/5" : "border-outline-variant/50 hover:border-secondary hover:bg-surface-container-low"}`}
                  key={id}
                >
                  <button
                    aria-label={done ? "Mark incomplete" : "Mark complete"}
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition ${done ? "border-secondary bg-secondary text-on-secondary" : "border-outline-variant"}`}
                    onClick={() => toggle(id)}
                  >
                    {done ? <CheckCircle2 size={18} /> : null}
                  </button>
                  <div className="flex-1">
                    <h2 className={`flex items-center gap-2 font-heading text-lg font-semibold ${done ? "text-secondary line-through" : "text-primary"}`}>
                      <Icon size={18} />
                      {title}
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-on-surface-variant">{description}</p>
                  </div>
                  <Link
                    className="flex shrink-0 items-center rounded-lg border border-outline-variant bg-surface px-3 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-low"
                    href={href}
                  >
                    {cta}
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
        <div className="mt-8 text-center">
          <Link
            className="inline-flex h-11 items-center rounded-lg bg-primary-container px-8 text-sm font-semibold text-on-primary"
            href="/dashboard"
          >
            {progress === steps.length ? "Go to Dashboard" : "Skip for now"}
          </Link>
        </div>
      </div>
    </main>
  );
}
