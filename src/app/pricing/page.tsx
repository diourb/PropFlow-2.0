import Link from "next/link";
import { ArrowRight, CheckCircle2, HelpCircle, Zap } from "lucide-react";
import { PublicHeader } from "@/components/public/public-header";
import { hasPayPalCredentials } from "@/lib/integrations/paypal";
import { hasSupabaseEnv } from "@/lib/supabase/env";

const plans = [
  {
    slug: "starter",
    name: "Starter",
    price: "$49",
    period: "/mo",
    description: "Perfect for independent landlords and small portfolios up to 10 units.",
    features: [
      "Up to 10 properties",
      "Booking + lease management",
      "Cleaning & maintenance board",
      "Guest and tenant portal",
      "CSV + PDF exports",
      "Standard email support",
    ],
    featured: false,
    cta: "Start Free Trial",
  },
  {
    slug: "professional",
    name: "Professional",
    price: "$149",
    period: "/mo",
    description: "For growing property management teams with advanced workflows and integrations.",
    features: [
      "Up to 50 properties",
      "Everything in Starter",
      "Channel sync (Airbnb, VRBO, Google Cal)",
      "Owner statements & payout automation",
      "Field staff PWA portals",
      "SMS & push notifications",
      "Priority support",
    ],
    featured: true,
    cta: "Start Free Trial",
  },
  {
    slug: "enterprise",
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Custom deployment for institutional portfolios with dedicated success management.",
    features: [
      "Unlimited properties",
      "Everything in Professional",
      "Custom API integrations",
      "Dedicated onboarding & CSM",
      "White-label options",
      "SLA guarantees",
    ],
    featured: false,
    cta: "Contact Sales",
  },
];

const faqs = [
  {
    q: "Do I need a credit card to start?",
    a: "No. You can explore the full demo without any payment details. Billing is only required when you activate a paid plan.",
  },
  {
    q: "Can I switch plans later?",
    a: "Yes. You can upgrade or downgrade at any time from your workspace billing settings. Prorated credits apply automatically.",
  },
  {
    q: "What counts as a 'property'?",
    a: "Each distinct unit or listing counts as one property — whether it's a short-term rental, long-term lease, or mixed-use unit.",
  },
  {
    q: "Is the field staff app included?",
    a: "Yes. Cleaner and maintenance tech portals (including the mobile PWA) are included in Professional and above.",
  },
  {
    q: "What integrations are available?",
    a: "Google Calendar, Airbnb, VRBO, QuickBooks, Twilio (SMS), and Resend (email) are built in. More are added regularly.",
  },
  {
    q: "Can owners access their own data?",
    a: "Yes. Owner portal access with statements, payout history, property performance, and maintenance visibility is included on all plans.",
  },
];

type PricingSearchParams = {
  billing?: string;
  plan?: string;
};

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<PricingSearchParams>;
}) {
  const { billing } = await searchParams;
  const supabaseReady = hasSupabaseEnv();
  const anyPayPalPlanReady = plans.some((plan) => plan.slug !== "enterprise" && hasPayPalCredentials(plan.slug));
  const billingNotice =
    billing === "use_checkout_button"
      ? "Use a checkout button below to start a secure PayPal subscription."
      : billing === "not_configured"
        ? "PayPal plan credentials are missing for that plan. Choose workspace setup while billing is configured."
        : !supabaseReady
          ? "Live checkout requires Supabase and PayPal configuration. Demo access and workspace setup are always available."
          : !anyPayPalPlanReady
            ? "Billing provider setup is required for live checkout. Demo access and workspace setup are always available."
            : null;

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <PublicHeader />
      <main>

        {/* ── Hero ── */}
        <section className="px-5 pb-16 pt-20 text-center md:px-10 md:pt-28">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary-container/30 px-4 py-1.5 text-xs font-bold text-on-secondary-container">
              <Zap size={13} />
              Launch-ready operations
            </div>
            <h1 className="font-heading text-5xl font-extrabold tracking-tight text-primary md:text-6xl">
              Simple, transparent pricing
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-on-surface-variant">
              No hidden seat fees. No per-integration charges. Pick the plan
              that matches your portfolio size and get every workflow included.
            </p>
            {billingNotice ? (
              <div className="mx-auto mt-6 max-w-md rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-5 py-3 text-sm text-on-surface-variant">
                {billingNotice}
              </div>
            ) : null}
          </div>
        </section>

        {/* ── Plan cards ── */}
        <section className="px-5 pb-24 md:px-10">
          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
            {plans.map((plan) => {
              const checkoutReady = supabaseReady && plan.slug !== "enterprise" && hasPayPalCredentials(plan.slug);
              const ctaClass = `flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold transition ${
                plan.featured
                  ? "bg-secondary text-on-secondary hover:bg-secondary-fixed"
                  : "border border-outline-variant bg-surface-container-lowest text-primary hover:bg-surface-container-low"
              }`;
              const ctaLabel = checkoutReady || plan.slug === "enterprise" ? plan.cta : "Start Workspace Setup";

              return (
                <div
                  key={plan.slug}
                  className={`relative flex flex-col rounded-2xl border p-8 ${
                    plan.featured
                      ? "border-secondary/40 bg-primary-container text-on-primary shadow-[0_16px_48px_-8px_rgba(0,0,0,0.2)]"
                      : "border-outline-variant/30 bg-surface-container-lowest"
                  }`}
                >
                  {plan.featured && (
                    <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary px-5 py-1 text-xs font-bold uppercase tracking-wide text-on-secondary">
                      Most Popular
                    </span>
                  )}
                  <h2 className="mb-1 font-heading text-2xl font-semibold">{plan.name}</h2>
                  <p className={`mb-6 min-h-10 text-sm leading-6 ${plan.featured ? "text-on-primary/70" : "text-on-surface-variant"}`}>
                    {plan.description}
                  </p>
                  <div className="mb-8 flex items-end gap-1">
                    <span className="font-heading text-5xl font-extrabold">{plan.price}</span>
                    {plan.period && <span className={`mb-1.5 text-sm font-semibold ${plan.featured ? "text-on-primary/60" : "text-on-surface-variant"}`}>{plan.period}</span>}
                  </div>
                  <ul className="mb-8 flex-1 space-y-3.5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm">
                        <CheckCircle2 className={`mt-0.5 shrink-0 ${plan.featured ? "text-secondary-fixed" : "text-secondary"}`} size={17} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {checkoutReady ? (
                    <form action="/api/paypal/create-subscription" method="post">
                      <input name="plan" type="hidden" value={plan.slug} />
                      <button className={ctaClass} type="submit">
                        {ctaLabel} <ArrowRight size={16} />
                      </button>
                    </form>
                  ) : (
                    <Link
                      href="/workspace"
                      className={ctaClass}
                    >
                      {ctaLabel} {plan.slug !== "enterprise" && <ArrowRight size={16} />}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Feature comparison hint ── */}
        <section className="border-y border-outline-variant/20 bg-surface-container-lowest/50 px-5 py-16 text-center md:px-10">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-heading text-2xl font-semibold text-primary">
              All plans include core functionality
            </h2>
            <p className="mt-3 text-on-surface-variant">
              Booking management, cleaning workflows, maintenance board, guest portal, owner statements, notifications, and role-based access are available on every plan.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm font-semibold text-on-surface-variant">
              {[
                "Booking & lease management",
                "Cleaning task automation",
                "Maintenance board",
                "Owner & guest portals",
                "CSV / PDF exports",
                "7 user roles",
              ].map((item) => (
                <span key={item} className="flex items-center gap-2 rounded-full border border-outline-variant/50 bg-surface-container-lowest px-4 py-2">
                  <CheckCircle2 className="text-secondary" size={15} />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="px-5 py-24 md:px-10">
          <div className="mx-auto max-w-3xl">
            <div className="mb-12 text-center">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-secondary">Got questions?</p>
              <h2 className="font-heading text-4xl font-semibold text-primary">Frequently asked questions</h2>
            </div>
            <div className="space-y-4">
              {faqs.map(({ q, a }) => (
                <div key={q} className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="mt-0.5 shrink-0 text-secondary" size={18} />
                    <div>
                      <p className="font-semibold text-primary">{q}</p>
                      <p className="mt-2 text-sm leading-7 text-on-surface-variant">{a}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Enterprise CTA ── */}
        <section className="px-5 pb-24 md:px-10">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl bg-primary-container px-8 py-14 text-center text-on-primary ambient-shadow">
            <h2 className="font-heading text-3xl font-semibold">Managing 100+ units?</h2>
            <p className="mx-auto mt-3 max-w-xl text-on-primary/80">
              We offer custom deployment, dedicated onboarding, volume discounts, and white-label options for institutional portfolios.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/workspace"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-secondary px-8 text-sm font-bold text-on-secondary transition hover:bg-secondary-fixed"
              >
                Talk to an Expert <ArrowRight size={16} />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-on-primary/20 bg-on-primary/10 px-8 text-sm font-bold text-on-primary transition hover:bg-on-primary/20"
              >
                Explore Demo First
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-outline-variant/30 px-5 py-8 text-center text-sm text-on-surface-variant md:px-10">
        <div className="mx-auto max-w-[1440px] flex flex-col items-center justify-between gap-4 md:flex-row">
          <p>© {new Date().getFullYear()} PropFlow. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-primary">Home</Link>
            <Link href="/#features" className="hover:text-primary">Features</Link>
            <Link href="/login" className="hover:text-primary">Login</Link>
            <Link href="/workspace" className="hover:text-primary">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
