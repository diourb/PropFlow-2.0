import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Route,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import { PublicHeader } from "@/components/public/public-header";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-on-surface">
      <PublicHeader />
      <main>
        <section className="relative overflow-hidden px-5 pb-24 pt-20 md:px-10 md:pt-28">
          <div className="absolute right-[-12rem] top-[-12rem] h-[34rem] w-[34rem] rounded-full bg-secondary-container/30 blur-3xl" />
          <div className="absolute bottom-[-18rem] left-[-16rem] h-[42rem] w-[42rem] rounded-full bg-primary-fixed/40 blur-3xl" />
          <div className="relative mx-auto max-w-[1440px]">
            <div className="mx-auto mb-14 flex max-w-4xl flex-col items-center text-center">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-outline-variant/50 bg-surface-container-high px-3 py-1.5 text-xs font-semibold text-primary">
                <span className="h-2 w-2 rounded-full bg-secondary" />
                PropFlow 2.0 is now live
              </div>
              <h1 className="font-heading text-5xl font-extrabold leading-[1.05] text-primary md:text-7xl">
                Manage your portfolio like a pro
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-on-surface-variant">
                Institutional-grade workflows for mixed rental portfolios:
                bookings, leases, owner statements, cleaning, maintenance,
                guests, tenants, and field operations in one polished command
                center.
              </p>
              <div className="mt-10 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Link
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-lg bg-primary-container px-8 text-sm font-semibold text-on-primary ambient-shadow transition hover:bg-primary"
                  href="/workspace"
                >
                  Start Free Trial
                  <ArrowRight size={18} />
                </Link>
                <Link
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-8 text-sm font-semibold text-primary"
                  href="/dashboard"
                >
                  View Demo
                </Link>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-outline-variant/40 bg-surface-container-lowest ambient-shadow-lg">
              <div className="flex h-12 items-center gap-2 border-b border-outline-variant/30 bg-surface-container-low px-4">
                <span className="h-3 w-3 rounded-full bg-outline-variant/60" />
                <span className="h-3 w-3 rounded-full bg-outline-variant/60" />
                <span className="h-3 w-3 rounded-full bg-outline-variant/60" />
                <span className="mx-auto h-6 w-1/3 rounded bg-surface-container-lowest" />
              </div>
              <div className="grid gap-0 lg:grid-cols-[280px_1fr]">
                <div className="hidden bg-primary-container p-6 text-on-primary lg:block">
                  <div className="mb-8 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded bg-secondary text-on-secondary">
                      <Building2 size={20} />
                    </span>
                    <span className="font-heading text-xl font-bold">
                      PropFlow
                    </span>
                  </div>
                  {[
                    "Dashboard",
                    "Properties",
                    "Bookings",
                    "Cleaning",
                    "Maintenance",
                    "Owners",
                  ].map((item, index) => (
                    <div
                      className={`mb-2 rounded-lg px-4 py-3 text-sm font-semibold ${
                        index === 0
                          ? "border-l-4 border-secondary bg-secondary/10"
                          : "text-on-primary/70"
                      }`}
                      key={item}
                    >
                      {item}
                    </div>
                  ))}
                </div>
                <div className="bg-background p-6 md:p-8">
                  <div className="mb-6">
                    <h2 className="font-heading text-3xl font-semibold text-primary">
                      Overview
                    </h2>
                    <p className="mt-1 text-on-surface-variant">
                      Monitor portfolio performance and daily operations.
                    </p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-4">
                    {[
                      ["Gross Revenue", "$142,500", "+12.5%"],
                      ["Net Profit", "$98,200", "+8.2%"],
                      ["Occupancy", "88%", "Stable"],
                      ["Ops Health", "94/100", "Optimal"],
                    ].map(([label, value, delta]) => (
                      <div
                        className="rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-4"
                        key={label}
                      >
                        <div className="text-xs font-bold uppercase text-on-surface-variant">
                          {label}
                        </div>
                        <div className="mt-5 font-heading text-2xl font-semibold text-primary">
                          {value}
                        </div>
                        <div className="mt-1 text-xs font-semibold text-secondary">
                          {delta}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 grid gap-4 md:grid-cols-[1fr_320px]">
                    <div className="min-h-72 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6">
                      <div className="mb-6 font-heading text-xl font-semibold text-primary">
                        Revenue vs Expenses
                      </div>
                      <div className="flex h-48 items-end gap-3">
                        {[45, 65, 82, 76, 92, 96].map((height, index) => (
                          <div className="flex flex-1 items-end gap-1" key={height}>
                            <span
                              className="w-full rounded-t bg-primary-container"
                              style={{ height: `${height}%` }}
                            />
                            <span
                              className="w-full rounded-t bg-secondary-fixed"
                              style={{ height: `${height * 0.55}%` }}
                            />
                            <span className="sr-only">Month {index + 1}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6">
                      <div className="mb-4 font-heading text-xl font-semibold text-primary">
                        Today&apos;s Operations
                      </div>
                      {[
                        ["4", "Cleanings Scheduled", "clean"],
                        ["2", "Urgent Work Orders", "alert"],
                      ].map(([count, label, kind]) => (
                        <div
                          className={`mb-4 rounded-lg p-4 ${
                            kind === "alert"
                              ? "bg-error-container/30"
                              : "bg-surface-container-low"
                          }`}
                          key={label}
                        >
                          <div className="font-heading text-2xl font-semibold text-primary">
                            {count}
                          </div>
                          <div className="text-sm text-on-surface-variant">
                            {label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className="border-y border-outline-variant/20 bg-surface-container-lowest/70 py-12"
          id="features"
        >
          <div className="mx-auto max-w-[1440px] px-5 text-center md:px-10">
            <p className="mb-8 text-xs font-bold uppercase tracking-[0.24em] text-outline">
              Trusted by institutional portfolios
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 text-on-surface-variant md:gap-14">
              {["Stellar Real Estate", "Urban Horizon", "Apex Properties", "Meridian Capital"].map(
                (name) => (
                  <span className="flex items-center gap-2 font-heading font-bold" key={name}>
                    <Building2 size={26} />
                    {name}
                  </span>
                ),
              )}
            </div>
          </div>
        </section>

        <section className="px-5 py-24 md:px-10">
          <div className="mx-auto max-w-[1440px]">
            <div className="mb-14">
              <h2 className="font-heading text-4xl font-semibold text-primary">
                Engineered for precision.
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-on-surface-variant">
                Everything needed to scale rental operations, unified in a
                single platform with role-aware workflows.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                [ShieldCheck, "Granular Role-Based Access", "Permissions for admins, managers, owners, cleaners, maintenance teams, tenants, and guests."],
                [Route, "Automated Routing", "Issue reports and turnovers can be assigned by availability, location, skill set, and priority."],
                [Workflow, "Unified Operations", "Bookings, leases, cleaning, maintenance, statements, notifications, and integrations share one data model."],
                [CalendarCheck, "Channel Calendar Sync", "Credential-gated Airbnb, VRBO, Google Calendar, and iCal workflows are ready for production access."],
                [Sparkles, "PWA Field Experience", "Cleaner and technician mobile flows are optimized for daily task execution and issue reporting."],
                [CheckCircle2, "Owner-Ready Reporting", "CSV exports ship first, with QuickBooks integration designed into the connector framework."],
              ].map(([Icon, title, description]) => (
                <div
                  className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-7 ambient-shadow"
                  key={String(title)}
                >
                  <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-container/10 text-primary-container">
                    <Icon size={23} />
                  </span>
                  <h3 className="font-heading text-xl font-semibold text-primary">
                    {String(title)}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                    {String(description)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
