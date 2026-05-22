import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { PublicHeader } from "@/components/public/public-header";
import { hasPayPalCredentials } from "@/lib/integrations/paypal";

const plans = [
  {
    slug: "starter",
    name: "Starter",
    price: "$49",
    description: "Perfect for independent landlords with small portfolios.",
    features: ["Up to 10 properties", "Basic reporting", "Tenant portal access", "Standard support"],
  },
  {
    slug: "professional",
    name: "Professional",
    price: "$149",
    description: "For growing teams needing advanced operational workflows.",
    features: ["Up to 50 properties", "Advanced analytics", "Automated maintenance workflows", "Owner portal", "Priority support"],
    featured: true,
  },
  {
    slug: "enterprise",
    name: "Enterprise",
    price: "Custom",
    description: "Custom deployment for large institutional portfolios.",
    features: ["Unlimited properties", "Custom API integrations", "Dedicated success manager", "White-label options"],
  },
];

export default function PricingPage() {
  const billingReady = hasPayPalCredentials();

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main className="mx-auto max-w-[1440px] px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h1 className="font-heading text-5xl font-bold text-primary">
            Simple, transparent pricing.
          </h1>
          <p className="mt-4 text-lg leading-8 text-on-surface-variant">
            Choose the plan that fits your operation. PayPal subscriptions are
            the primary billing provider for v1.
          </p>
          {!billingReady ? (
            <p className="mt-4 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm font-semibold text-on-surface-variant">
              Billing provider setup is required before live subscription checkout.
              Demo signup and workspace setup remain available.
            </p>
          ) : null}
        </div>
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              className={`relative flex flex-col rounded-xl border p-8 ambient-shadow ${
                plan.featured
                  ? "scale-[1.03] border-secondary bg-primary-container text-on-primary"
                  : "border-outline-variant bg-surface-container-lowest text-on-surface"
              }`}
              key={plan.slug}
            >
              {plan.featured ? (
                <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary px-4 py-1 text-xs font-bold uppercase tracking-wide text-on-secondary">
                  Most Popular
                </span>
              ) : null}
              <h2 className="font-heading text-2xl font-semibold">{plan.name}</h2>
              <p className={`mt-2 min-h-12 text-sm leading-6 ${plan.featured ? "text-on-primary/80" : "text-on-surface-variant"}`}>
                {plan.description}
              </p>
              <div className="my-8">
                <span className="font-heading text-5xl font-bold">{plan.price}</span>
                {plan.price.startsWith("$") ? <span className="text-sm">/mo</span> : null}
              </div>
              <ul className="mb-8 flex-1 space-y-4">
                {plan.features.map((feature) => (
                  <li className="flex items-start gap-3 text-sm" key={feature}>
                    <CheckCircle2 className={plan.featured ? "text-secondary-fixed" : "text-secondary"} size={20} />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                className={`flex h-11 items-center justify-center rounded-lg text-sm font-semibold ${
                  plan.featured
                    ? "bg-secondary text-on-secondary"
                    : "border border-outline-variant bg-surface-container-lowest text-primary-container"
                }`}
                href={billingReady ? `/api/paypal/create-subscription?plan=${plan.slug}` : "/workspace"}
              >
                {plan.name === "Enterprise" ? "Contact Sales" : billingReady ? "Start Free Trial" : "Start Workspace Setup"}
              </Link>
            </div>
          ))}
        </div>
        <section className="mx-auto mt-24 flex max-w-4xl flex-col items-center justify-between gap-8 rounded-xl border border-outline-variant/50 bg-surface-container p-10 ambient-shadow md:flex-row">
          <div>
            <h2 className="font-heading text-xl font-semibold text-primary">
              Have a large portfolio?
            </h2>
            <p className="mt-2 text-on-surface-variant">
              We offer custom deployment plans, dedicated onboarding, and volume
              discounts for portfolios over 100 units.
            </p>
          </div>
          <Link
            className="h-11 whitespace-nowrap rounded-lg bg-primary-container px-8 py-3 text-sm font-semibold text-on-primary"
            href="/workspace"
          >
            Talk to an Expert
          </Link>
        </section>
      </main>
    </div>
  );
}
