"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bell,
  Building2,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  Download,
  Hammer,
  Home,
  KeyRound,
  MapPin,
  MessageSquare,
  Play,
  Route,
  ShieldCheck,
  Sparkles,
  SprayCan,
  Star,
  TrendingUp,
  Users,
  Workflow,
  Zap,
} from "lucide-react";
import { PublicHeader } from "@/components/public/public-header";

/* ─── Static demo data used throughout ─── */
const demoBookings = [
  { guest: "Marcus Johnson", property: "Sunset Villa", nights: 5, amount: "$1,850", status: "Checked-in", platform: "Airbnb", initials: "MJ" },
  { guest: "Priya Nair", property: "Downtown Loft", nights: 3, amount: "$720", status: "Confirmed", platform: "Direct", initials: "PN" },
  { guest: "Tom Ellis", property: "Beachfront Condo", nights: 7, amount: "$3,290", status: "Pending", platform: "VRBO", initials: "TE" },
  { guest: "Lena Fischer", property: "Garden Suite", nights: 2, amount: "$480", status: "Checked-out", platform: "Airbnb", initials: "LF" },
];

const demoCleaningTasks = [
  { property: "Sunset Villa", type: "Turnover — Standard Reset", checkIn: "3:00 PM", room: "Master Bedroom", items: 8, done: 6, status: "in_progress" },
  { property: "Downtown Loft", type: "Deep Clean", checkIn: "2:00 PM", room: "Kitchen", items: 6, done: 6, status: "completed" },
  { property: "Beachfront Condo", type: "Turnover — Express", checkIn: "4:00 PM", room: "Living Room", items: 5, done: 0, status: "pending" },
];

const demoMaintenance = [
  { title: "HVAC filter replacement", property: "Sunset Villa", priority: "Routine", status: "in_progress", assignee: "Mike Torres", reportedAgo: "2d ago" },
  { title: "Burst pipe — bathroom", property: "Beachfront Condo", priority: "Critical", status: "urgent", assignee: "James Park", reportedAgo: "4h ago" },
  { title: "Pool pump noise", property: "Garden Suite", priority: "High Priority", status: "awaiting_parts", assignee: "Mike Torres", reportedAgo: "1d ago" },
  { title: "Exterior lighting", property: "Downtown Loft", priority: "Low", status: "completed", assignee: "Lisa Kim", reportedAgo: "5d ago" },
];

const demoProperties = [
  { name: "Sunset Villa", location: "Miami, FL", occupancy: 92, revenue: 38400, status: "Occupied", bedrooms: 4 },
  { name: "Downtown Loft", location: "Austin, TX", occupancy: 87, revenue: 24900, status: "Vacant", bedrooms: 2 },
  { name: "Beachfront Condo", location: "Malibu, CA", occupancy: 78, revenue: 52100, status: "Cleaning", bedrooms: 3 },
  { name: "Garden Suite", location: "Nashville, TN", occupancy: 95, revenue: 19800, status: "Occupied", bedrooms: 1 },
];

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "bookings", label: "Bookings", icon: Calendar },
  { id: "cleaning", label: "Cleaning", icon: SprayCan },
  { id: "maintenance", label: "Maintenance", icon: Hammer },
  { id: "owners", label: "Owner Portal", icon: KeyRound },
];

const statusTone: Record<string, string> = {
  "Checked-in": "bg-secondary-container text-on-secondary-container",
  Confirmed: "bg-primary-container/60 text-on-primary",
  Pending: "bg-surface-container-high text-on-surface-variant",
  "Checked-out": "bg-surface-container text-outline",
  in_progress: "bg-secondary-container text-on-secondary-container",
  completed: "bg-secondary-container/50 text-on-secondary-container",
  pending: "bg-surface-container-high text-on-surface-variant",
  urgent: "bg-error-container text-error",
  awaiting_parts: "bg-tertiary-fixed/30 text-on-surface-variant",
};

function StatusBadge({ label, status }: { label: string; status: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusTone[status] ?? "bg-surface-container text-on-surface-variant"}`}>
      {label}
    </span>
  );
}

/* ─── Demo tab panels ─── */
function DashboardPanel() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { label: "Gross Revenue", value: "$142,500", delta: "+12.5% YTD", icon: TrendingUp, accent: true },
          { label: "Net Profit", value: "$98,200", delta: "+8.2% vs last yr", icon: BarChart3, accent: false },
          { label: "Occupancy", value: "88%", delta: "4 active properties", icon: Building2, accent: false },
          { label: "Ops Health", value: "94/100", delta: "2 urgent items", icon: Sparkles, accent: false },
        ].map(({ label, value, delta, icon: Icon, accent }) => (
          <div key={label} className={`rounded-xl border p-4 ${accent ? "border-secondary/30 bg-secondary-container/30" : "border-outline-variant/30 bg-surface-container-lowest"}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">{label}</span>
              <Icon className="text-secondary" size={16} />
            </div>
            <div className="mt-3 font-heading text-2xl font-semibold text-primary">{value}</div>
            <div className="mt-1 text-xs font-semibold text-secondary">{delta}</div>
          </div>
        ))}
      </div>
      <div className="grid gap-3 lg:grid-cols-[1fr_260px]">
        <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-5">
          <div className="mb-4 font-heading text-base font-semibold text-primary">Revenue vs Expenses (2025)</div>
          <div className="flex h-36 items-end gap-2">
            {[62, 74, 68, 88, 95, 100, 91, 96, 78, 84, 90, 97].map((h, i) => (
              <div className="flex flex-1 flex-col items-center gap-1" key={i}>
                <div className="flex w-full items-end gap-0.5">
                  <div className="w-full rounded-t-sm bg-primary-container" style={{ height: `${h * 1.3}px` }} />
                  <div className="w-full rounded-t-sm bg-secondary-fixed/60" style={{ height: `${h * 0.7}px` }} />
                </div>
                <span className="text-[9px] text-outline">{["J","F","M","A","M","J","J","A","S","O","N","D"][i]}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-4 text-xs font-semibold text-on-surface-variant">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-primary-container" />Revenue</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-secondary-fixed/60" />Expenses</span>
          </div>
        </div>
        <div className="space-y-3">
          <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
                <SprayCan size={18} />
              </span>
              <div>
                <div className="font-heading text-2xl font-semibold text-primary">4</div>
                <div className="text-xs text-on-surface-variant">Cleanings today</div>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-error/20 bg-error-container/20 p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-error-container text-error">
                <Hammer size={18} />
              </span>
              <div>
                <div className="font-heading text-2xl font-semibold text-error">2</div>
                <div className="text-xs text-on-surface-variant">Urgent work orders</div>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container/40 text-on-primary">
                <Bell size={18} />
              </span>
              <div>
                <div className="font-heading text-2xl font-semibold text-primary">7</div>
                <div className="text-xs text-on-surface-variant">Unread notifications</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BookingsPanel() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {["All Platforms", "Airbnb", "VRBO", "Direct"].map((p, i) => (
            <span key={p} className={`rounded-full px-3 py-1 text-xs font-semibold ${i === 0 ? "bg-primary-container text-on-primary" : "bg-surface-container-high text-on-surface-variant"}`}>{p}</span>
          ))}
        </div>
        <button className="flex items-center gap-1.5 rounded-lg border border-outline-variant px-3 py-1.5 text-xs font-semibold text-on-surface-variant">
          <Download size={13} /> Export CSV
        </button>
      </div>
      <div className="overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-container-low text-xs font-bold uppercase text-on-surface-variant">
            <tr>
              <th className="px-4 py-3">Guest</th>
              <th className="px-4 py-3">Property</th>
              <th className="hidden px-4 py-3 md:table-cell">Platform</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30">
            {demoBookings.map((b) => (
              <tr key={b.guest} className="hover:bg-surface-container-low">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-container/40 text-xs font-semibold text-on-primary">{b.initials}</span>
                    <span className="font-semibold text-on-surface">{b.guest}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-on-surface-variant">{b.property}</td>
                <td className="hidden px-4 py-3 text-on-surface-variant md:table-cell">{b.platform}</td>
                <td className="px-4 py-3 font-semibold text-on-surface">{b.amount}</td>
                <td className="px-4 py-3"><StatusBadge label={b.status} status={b.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CleaningPanel() {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        {demoCleaningTasks.map((t) => (
          <div key={t.property} className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <p className="font-semibold text-primary">{t.property}</p>
                <p className="text-xs text-on-surface-variant">Check-in {t.checkIn}</p>
              </div>
              <StatusBadge label={t.status.replace("_", " ")} status={t.status} />
            </div>
            <p className="mb-3 text-sm text-on-surface-variant">{t.type}</p>
            <div className="mb-1 flex justify-between text-xs font-semibold">
              <span className="text-on-surface-variant">Checklist</span>
              <span className="text-secondary">{t.done}/{t.items}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-container-high">
              <div className="h-full rounded-full bg-secondary transition-all" style={{ width: `${(t.done / t.items) * 100}%` }} />
            </div>
            <div className="mt-3">
              <button className={`h-8 w-full rounded-lg text-xs font-semibold ${t.status === "completed" ? "bg-surface-container text-on-surface-variant" : "bg-primary-container text-on-primary"}`}>
                {t.status === "completed" ? "View Report" : t.status === "in_progress" ? "Continue Cleaning" : "Start Cleaning"}
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-on-surface">Checklist Progress: Master Bedroom</span>
          <span className="text-xs font-bold text-secondary">6/8 items</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {["Strip beds", "Wash linens", "Vacuum floors", "Dust surfaces", "Clean mirrors", "Restock towels"].map((item, i) => (
            <span key={item} className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${i < 6 ? "bg-secondary/10 text-secondary line-through" : "bg-surface-container text-on-surface-variant"}`}>
              {i < 6 && <CheckCircle2 size={11} />}{item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function MaintenancePanel() {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {["All", "Urgent", "In Progress", "Awaiting Parts", "Completed"].map((f, i) => (
          <span key={f} className={`rounded-full px-3 py-1 text-xs font-semibold ${i === 0 ? "bg-error-container text-error" : "bg-surface-container-high text-on-surface-variant"}`}>{f}</span>
        ))}
      </div>
      <div className="space-y-2">
        {demoMaintenance.map((r) => (
          <div key={r.title} className={`flex items-center justify-between rounded-xl border p-4 ${r.status === "urgent" ? "border-error/30 bg-error-container/10" : "border-outline-variant/30 bg-surface-container-lowest"}`}>
            <div className="flex items-center gap-3">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${r.status === "urgent" ? "bg-error-container text-error" : "bg-surface-container-high text-on-surface-variant"}`}>
                <Hammer size={16} />
              </span>
              <div>
                <p className="font-semibold text-on-surface">{r.title}</p>
                <p className="flex items-center gap-1 text-xs text-on-surface-variant">
                  <MapPin size={11} />{r.property} · {r.reportedAgo}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right md:block">
                <p className="text-xs text-on-surface-variant">Assignee</p>
                <p className="text-xs font-semibold text-on-surface">{r.assignee}</p>
              </div>
              <StatusBadge label={r.priority} status={r.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OwnerPanel() {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {demoProperties.map((p) => (
          <div key={p.name} className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4">
            <div className="mb-2 flex items-start justify-between">
              <div>
                <p className="font-semibold text-primary">{p.name}</p>
                <p className="flex items-center gap-1 text-xs text-on-surface-variant"><MapPin size={11} />{p.location}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${p.status === "Occupied" ? "bg-secondary-container/50 text-on-secondary-container" : p.status === "Cleaning" ? "bg-primary-container/50 text-on-primary" : "bg-surface-container-high text-on-surface-variant"}`}>{p.status}</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-surface-container-low p-2">
                <p className="text-on-surface-variant">Revenue</p>
                <p className="font-heading text-base font-semibold text-primary">${(p.revenue / 1000).toFixed(0)}k</p>
              </div>
              <div className="rounded-lg bg-surface-container-low p-2">
                <p className="text-on-surface-variant">Occupancy</p>
                <p className="font-heading text-base font-semibold text-secondary">{p.occupancy}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-heading text-base font-semibold text-primary">Owner Statements — Q4 2025</h3>
          <button className="flex items-center gap-1.5 rounded-lg border border-outline-variant px-3 py-1.5 text-xs font-semibold text-on-surface-variant">
            <Download size={12} /> Export All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs font-bold uppercase text-on-surface-variant">
              <tr>
                <th className="pb-2">Owner</th>
                <th className="pb-2">Properties</th>
                <th className="pb-2">Revenue</th>
                <th className="pb-2">Payout</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {[
                ["Rebecca Cole", 2, 62300, 54100, "sent"],
                ["David Wu", 1, 52100, 45800, "ready"],
                ["Annette Rivera", 1, 19800, 17200, "draft"],
              ].map(([owner, props, rev, payout, status]) => (
                <tr key={String(owner)} className="hover:bg-surface-container-low">
                  <td className="py-2.5 font-semibold text-on-surface">{String(owner)}</td>
                  <td className="py-2.5 text-on-surface-variant">{String(props)} properties</td>
                  <td className="py-2.5 text-on-surface">${Number(rev).toLocaleString()}</td>
                  <td className="py-2.5 font-semibold text-secondary">${Number(payout).toLocaleString()}</td>
                  <td className="py-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${status === "sent" ? "bg-secondary-container/50 text-on-secondary-container" : status === "ready" ? "bg-primary-container/40 text-on-primary" : "bg-surface-container-high text-on-surface-variant"}`}>{String(status)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const panelMap: Record<string, React.ReactNode> = {
  dashboard: <DashboardPanel />,
  bookings: <BookingsPanel />,
  cleaning: <CleaningPanel />,
  maintenance: <MaintenancePanel />,
  owners: <OwnerPanel />,
};

/* ─── Main landing page ─── */
export default function LandingPage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <PublicHeader />
      <main>

        {/* ── Hero ── */}
        <section className="relative overflow-hidden px-5 pb-16 pt-16 md:px-10 md:pt-24">
          <div className="pointer-events-none absolute right-[-16rem] top-[-14rem] h-[42rem] w-[42rem] rounded-full bg-secondary-container/25 blur-3xl" />
          <div className="pointer-events-none absolute bottom-[-20rem] left-[-18rem] h-[50rem] w-[50rem] rounded-full bg-primary-fixed/30 blur-3xl" />

          <div className="relative mx-auto max-w-[1440px]">
            <div className="mx-auto mb-12 flex max-w-4xl flex-col items-center text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary-container/30 px-4 py-1.5 text-xs font-bold text-on-secondary-container">
                <span className="h-2 w-2 animate-pulse rounded-full bg-secondary" />
                PropFlow 2.0 — Now in early access
              </div>
              <h1 className="font-heading text-5xl font-extrabold leading-[1.05] tracking-tight text-primary md:text-[4.5rem]">
                Manage your rental
                <br />
                <span className="text-secondary">portfolio like a pro</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-on-surface-variant">
                Bookings, leases, cleaning, maintenance, guest CRM, owner
                statements, and field ops — unified in one command center built
                for property managers who demand precision.
              </p>
              <div className="mt-10 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Link
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-primary-container px-8 text-sm font-bold text-on-primary ambient-shadow transition hover:bg-primary"
                  href="/workspace"
                >
                  Start Free Trial
                  <ArrowRight size={18} />
                </Link>
                <Link
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest px-8 text-sm font-semibold text-primary transition hover:bg-surface-container-low"
                  href="/dashboard"
                >
                  <Play size={16} className="fill-current" />
                  Explore Demo
                </Link>
              </div>
              <p className="mt-4 text-xs text-on-surface-variant">
                No credit card required · Full demo access instantly
              </p>
            </div>

            {/* ── Interactive browser mockup ── */}
            <div className="overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container-lowest shadow-[0_32px_80px_-12px_rgba(0,0,0,0.18)]">
              {/* Browser chrome */}
              <div className="flex h-11 items-center gap-2 border-b border-outline-variant/30 bg-surface-container-low px-4">
                <span className="h-3 w-3 rounded-full bg-error/50" />
                <span className="h-3 w-3 rounded-full bg-secondary-fixed/60" />
                <span className="h-3 w-3 rounded-full bg-secondary/40" />
                <div className="mx-auto flex h-6 w-64 items-center justify-center rounded-md bg-surface-container px-3 text-xs text-on-surface-variant">
                  app.propflow.io/dashboard
                </div>
              </div>

              {/* App layout */}
              <div className="grid lg:grid-cols-[240px_1fr]">
                {/* Sidebar */}
                <div className="hidden border-r border-outline-variant/30 bg-primary-container p-5 text-on-primary lg:block">
                  <div className="mb-6 flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-on-secondary">
                      <Building2 size={17} />
                    </span>
                    <span className="font-heading text-lg font-bold">PropFlow</span>
                  </div>
                  <nav className="space-y-1">
                    {tabs.map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                          activeTab === id
                            ? "border-l-4 border-secondary bg-secondary/15 text-on-primary"
                            : "text-on-primary/60 hover:bg-on-primary-fixed-variant/10 hover:text-on-primary"
                        }`}
                      >
                        <Icon size={17} />
                        {label}
                      </button>
                    ))}
                    <div className="pt-2 opacity-50">
                      {[
                        { icon: Users, label: "Guests" },
                        { icon: ClipboardList, label: "Reports" },
                        { icon: Bell, label: "Notifications" },
                      ].map(({ icon: Icon, label }) => (
                        <div key={label} className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-on-primary/40">
                          <Icon size={17} />{label}
                        </div>
                      ))}
                    </div>
                  </nav>
                </div>

                {/* Main content */}
                <div className="bg-background p-4 md:p-6">
                  {/* Mobile tabs */}
                  <div className="mb-4 flex gap-2 overflow-x-auto lg:hidden">
                    {tabs.map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                          activeTab === id ? "bg-primary-container text-on-primary" : "bg-surface-container text-on-surface-variant"
                        }`}
                      >
                        <Icon size={13} />{label}
                      </button>
                    ))}
                  </div>

                  {/* Demo banner */}
                  <div className="mb-4 flex items-center gap-2 rounded-lg border border-secondary/20 bg-secondary/10 px-3 py-2 text-xs font-semibold text-on-secondary-container">
                    <Sparkles size={14} />
                    Demo mode — Switch personas to explore every role&apos;s view
                  </div>

                  <div className="mb-5">
                    <h2 className="font-heading text-2xl font-semibold text-primary capitalize">{activeTab === "owners" ? "Owner Portal" : activeTab}</h2>
                    <p className="text-sm text-on-surface-variant">
                      {activeTab === "dashboard" && "Portfolio performance and daily operations at a glance."}
                      {activeTab === "bookings" && "Short-term reservations and long-term lease occupancy."}
                      {activeTab === "cleaning" && "Turnover tasks, checklists, and issue reporting."}
                      {activeTab === "maintenance" && "Work orders, priorities, and field technician assignments."}
                      {activeTab === "owners" && "Financial statements, property performance, and CSV exports."}
                    </p>
                  </div>

                  <div className="min-h-[360px]">{panelMap[activeTab]}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Social proof strip ── */}
        <section className="border-y border-outline-variant/20 bg-surface-container-lowest/60 py-10">
          <div className="mx-auto max-w-[1440px] px-5 md:px-10">
            <p className="mb-7 text-center text-xs font-bold uppercase tracking-[0.22em] text-outline">
              Trusted by property teams managing 10–500 units
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 text-on-surface-variant md:gap-16">
              {[
                { icon: Building2, name: "Apex Properties" },
                { icon: Building2, name: "Stellar Real Estate" },
                { icon: Building2, name: "Urban Horizon" },
                { icon: Building2, name: "Meridian Capital" },
                { icon: Building2, name: "Coastal Living Group" },
              ].map(({ icon: Icon, name }) => (
                <span key={name} className="flex items-center gap-2 font-heading font-bold opacity-50 transition hover:opacity-80">
                  <Icon size={22} />{name}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Who it's built for ── */}
        <section className="px-5 py-24 md:px-10" id="roles">
          <div className="mx-auto max-w-[1440px]">
            <div className="mb-14 text-center">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-secondary">Role-aware workflows</p>
              <h2 className="font-heading text-4xl font-semibold text-primary md:text-5xl">
                One platform, every role
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-on-surface-variant">
                Separate portals for each stakeholder so everyone only sees what
                they need — no clutter, no confusion.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {[
                {
                  role: "Property Manager",
                  icon: Home,
                  color: "bg-primary-container/30 text-on-primary",
                  tagline: "Complete command center",
                  points: ["Unified bookings + leases dashboard", "Automated cleaning task generation", "Maintenance board with priority triage", "Owner statements + CSV exports", "Full team and integration settings"],
                },
                {
                  role: "Field Staff",
                  icon: SprayCan,
                  color: "bg-secondary-container/40 text-on-secondary-container",
                  tagline: "Mobile-first operations",
                  points: ["GPS-linked task card with check-in time", "Room-by-room checklist with photo upload", "One-tap issue report sent to maintenance", "Work order board with parts tracking", "Offline-capable PWA experience"],
                },
                {
                  role: "Owners & Guests",
                  icon: KeyRound,
                  color: "bg-tertiary-fixed/30 text-on-surface-variant",
                  tagline: "Transparent self-service",
                  points: ["Revenue, occupancy & payout dashboard", "Monthly statement PDF + CSV export", "Maintenance visibility per property", "Guest stay details and arrival guide", "In-portal maintenance request form"],
                },
              ].map(({ role, icon: Icon, color, tagline, points }) => (
                <div key={role} className="flex flex-col rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-8 ambient-shadow">
                  <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
                    <Icon size={24} />
                  </div>
                  <p className="mb-1 text-xs font-bold uppercase tracking-wide text-secondary">{tagline}</p>
                  <h3 className="mb-4 font-heading text-2xl font-semibold text-primary">{role}</h3>
                  <ul className="mt-auto space-y-3">
                    {points.map((point) => (
                      <li key={point} className="flex items-start gap-3 text-sm text-on-surface-variant">
                        <CheckCircle2 className="mt-0.5 shrink-0 text-secondary" size={16} />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features grid ── */}
        <section className="bg-surface-container-lowest/50 px-5 py-24 md:px-10" id="features">
          <div className="mx-auto max-w-[1440px]">
            <div className="mb-14">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-secondary">Platform capabilities</p>
              <h2 className="font-heading text-4xl font-semibold text-primary">
                Engineered for precision
              </h2>
              <p className="mt-4 max-w-2xl text-lg text-on-surface-variant">
                Everything you need to scale from 5 to 500 units without switching tools.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {[
                [ShieldCheck, "Granular Role-Based Access", "Seven distinct roles — platform admin, workspace admin, manager, owner, cleaner, maintenance tech, and guest — each with a tailored portal."],
                [Route, "Auto-Generated Turnovers", "Every short-term booking checkout fires a cleaning task automatically. No manual scheduling required."],
                [Workflow, "Unified Data Model", "Bookings, leases, cleaning, maintenance, and owner financials share one dataset — no stitching exports together."],
                [CalendarCheck, "Channel Calendar Sync", "Google Calendar, Airbnb, and VRBO connectors are credential-gated and production-ready for your API keys."],
                [Sparkles, "PWA Field Experience", "Cleaners and techs install PropFlow as a home-screen app. Checklists, photo upload, and GPS navigation work offline."],
                [Zap, "Real-Time Notifications", "Email via Resend, SMS via Twilio, and browser push keep every stakeholder updated without polling."],
                [BarChart3, "Owner Statement Engine", "Generate monthly statements with revenue, expenses, and payout per owner. Export to CSV or PDF in one click."],
                [MessageSquare, "Guest Self-Service Portal", "Guests view stay details, submit maintenance requests, and receive arrival instructions without calling anyone."],
                [BadgeCheck, "Supabase-Backed Security", "Row-level security on every table, encrypted OAuth tokens, and VAPID-signed push — production-grade from day one."],
              ].map(([Icon, title, description]) => (
                <div key={String(title)} className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-7 ambient-shadow transition hover:border-secondary/30 hover:-translate-y-0.5">
                  <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-container/20 text-on-primary">
                    <Icon size={22} />
                  </span>
                  <h3 className="mb-2 font-heading text-xl font-semibold text-primary">{String(title)}</h3>
                  <p className="text-sm leading-7 text-on-surface-variant">{String(description)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className="px-5 py-24 md:px-10">
          <div className="mx-auto max-w-[1440px]">
            <div className="mb-14 text-center">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-secondary">What managers say</p>
              <h2 className="font-heading text-4xl font-semibold text-primary">Real results for real teams</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  quote: "We replaced three separate tools with PropFlow in a single weekend. Owner statements that used to take half a day now export in seconds.",
                  name: "Rebecca Cole",
                  title: "Portfolio Director, Apex Properties",
                  rating: 5,
                  initials: "RC",
                },
                {
                  quote: "The cleaner app is the best part. My team checks in, works through the room checklist, photos the finish, and the job is done — no calls needed.",
                  name: "Marcus Torres",
                  title: "Ops Manager, Urban Horizon",
                  rating: 5,
                  initials: "MT",
                },
                {
                  quote: "Having owners see their own statements and maintenance history without emailing me has cut my weekly admin by at least 40%.",
                  name: "Priya Nair",
                  title: "Independent Host, 12 units",
                  rating: 5,
                  initials: "PN",
                },
              ].map(({ quote, name, title, rating, initials }) => (
                <div key={name} className="flex flex-col rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-8 ambient-shadow">
                  <div className="mb-4 flex gap-1">
                    {Array.from({ length: rating }).map((_, i) => (
                      <Star key={i} className="fill-secondary text-secondary" size={16} />
                    ))}
                  </div>
                  <blockquote className="flex-1 text-sm leading-7 text-on-surface-variant">&ldquo;{quote}&rdquo;</blockquote>
                  <div className="mt-6 flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-container text-sm font-bold text-on-primary">
                      {initials}
                    </span>
                    <div>
                      <p className="font-semibold text-on-surface">{name}</p>
                      <p className="text-xs text-on-surface-variant">{title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing teaser ── */}
        <section className="bg-surface-container-lowest/50 px-5 py-24 md:px-10" id="pricing">
          <div className="mx-auto max-w-[1440px]">
            <div className="mb-14 text-center">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-secondary">Pricing</p>
              <h2 className="font-heading text-4xl font-semibold text-primary">Simple, transparent plans</h2>
              <p className="mt-4 text-lg text-on-surface-variant">Scale from a handful of units to an institutional portfolio.</p>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
              {[
                {
                  name: "Starter",
                  price: "$49",
                  desc: "Independent landlords and small portfolios.",
                  features: ["Up to 10 properties", "Bookings + leases", "Cleaning & maintenance", "Owner statements"],
                  featured: false,
                },
                {
                  name: "Professional",
                  price: "$149",
                  desc: "Growing teams with advanced operational needs.",
                  features: ["Up to 50 properties", "Multi-channel integrations", "Field staff portals", "Priority support"],
                  featured: true,
                },
                {
                  name: "Enterprise",
                  price: "Custom",
                  desc: "Large institutional portfolios with custom needs.",
                  features: ["Unlimited properties", "Custom API access", "Dedicated onboarding", "White-label options"],
                  featured: false,
                },
              ].map(({ name, price, desc, features, featured }) => (
                <div
                  key={name}
                  className={`relative flex flex-col rounded-2xl border p-8 ${
                    featured
                      ? "border-secondary/40 bg-primary-container text-on-primary shadow-[0_8px_32px_-4px_rgba(0,0,0,0.18)]"
                      : "border-outline-variant/30 bg-surface-container-lowest"
                  }`}
                >
                  {featured && (
                    <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary px-4 py-1 text-xs font-bold uppercase tracking-wide text-on-secondary">
                      Most Popular
                    </span>
                  )}
                  <p className="font-heading text-xl font-semibold">{name}</p>
                  <p className={`mt-1 text-sm ${featured ? "text-on-primary/70" : "text-on-surface-variant"}`}>{desc}</p>
                  <div className="my-6">
                    <span className="font-heading text-4xl font-bold">{price}</span>
                    {price.startsWith("$") && <span className="text-sm">/mo</span>}
                  </div>
                  <ul className="mb-8 flex-1 space-y-3">
                    {features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <CheckCircle2 className={featured ? "mt-0.5 text-secondary-fixed" : "mt-0.5 text-secondary"} size={16} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/pricing"
                    className={`flex h-11 items-center justify-center rounded-xl text-sm font-bold ${
                      featured ? "bg-secondary text-on-secondary" : "border border-outline-variant bg-surface-container-lowest text-primary hover:bg-surface-container-low"
                    }`}
                  >
                    {name === "Enterprise" ? "Contact Sales" : "View Plan Details"}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="px-5 py-24 md:px-10">
          <div className="mx-auto max-w-[1440px]">
            <div className="relative overflow-hidden rounded-3xl bg-primary-container px-8 py-16 text-center text-on-primary ambient-shadow-lg md:px-16">
              <div className="pointer-events-none absolute right-[-8rem] top-[-8rem] h-64 w-64 rounded-full bg-secondary/20 blur-3xl" />
              <div className="pointer-events-none absolute bottom-[-8rem] left-[-8rem] h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
              <div className="relative">
                <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-on-primary/20 bg-on-primary/10 px-4 py-1.5 text-xs font-bold">
                  <Sparkles size={13} /> Limited early access spots available
                </span>
                <h2 className="mb-4 font-heading text-4xl font-semibold md:text-5xl">
                  Ready to run a tighter operation?
                </h2>
                <p className="mx-auto mb-10 max-w-xl text-lg text-on-primary/80">
                  Join property managers who have replaced spreadsheets and
                  fragmented tools with one purpose-built platform.
                </p>
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Link
                    href="/workspace"
                    className="inline-flex h-14 items-center gap-2 rounded-xl bg-secondary px-10 text-sm font-bold text-on-secondary ambient-shadow transition hover:bg-secondary-fixed"
                  >
                    Start Free Trial <ArrowRight size={18} />
                  </Link>
                  <Link
                    href="/dashboard"
                    className="inline-flex h-14 items-center gap-2 rounded-xl border border-on-primary/30 bg-on-primary/10 px-10 text-sm font-bold text-on-primary transition hover:bg-on-primary/20"
                  >
                    <Play size={16} className="fill-current" /> Explore Demo
                  </Link>
                </div>
                <p className="mt-6 text-sm text-on-primary/60">No credit card required · Cancel anytime</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-outline-variant/30 bg-surface-container-lowest px-5 py-12 md:px-10">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-10 md:grid-cols-[1fr_repeat(3,_auto)]">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-container text-on-primary">
                  <Building2 size={20} />
                </span>
                <span className="font-heading text-xl font-bold text-primary">PropFlow</span>
              </div>
              <p className="max-w-xs text-sm leading-7 text-on-surface-variant">
                Institutional-grade property management for teams who need every workflow in one place.
              </p>
            </div>
            {[
              {
                heading: "Product",
                links: [
                  { label: "Features", href: "/#features" },
                  { label: "Pricing", href: "/pricing" },
                  { label: "Live Demo", href: "/dashboard" },
                  { label: "Changelog", href: "/" },
                ],
              },
              {
                heading: "Workflows",
                links: [
                  { label: "Bookings", href: "/dashboard" },
                  { label: "Cleaning", href: "/dashboard" },
                  { label: "Maintenance", href: "/dashboard" },
                  { label: "Owner Portal", href: "/dashboard" },
                ],
              },
              {
                heading: "Account",
                links: [
                  { label: "Login", href: "/login" },
                  { label: "Create Workspace", href: "/workspace" },
                  { label: "Pricing", href: "/pricing" },
                  { label: "Support", href: "/" },
                ],
              },
            ].map(({ heading, links }) => (
              <div key={heading}>
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">{heading}</p>
                <ul className="space-y-3">
                  {links.map(({ label, href }) => (
                    <li key={label}>
                      <Link href={href} className="text-sm text-on-surface-variant transition hover:text-primary">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-outline-variant/20 pt-8 text-xs text-on-surface-variant md:flex-row">
            <p>© {new Date().getFullYear()} PropFlow. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/" className="hover:text-primary">Privacy Policy</Link>
              <Link href="/" className="hover:text-primary">Terms of Service</Link>
              <Link href="/" className="hover:text-primary">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
