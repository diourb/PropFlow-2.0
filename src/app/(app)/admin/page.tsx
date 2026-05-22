import { AlertTriangle, Database, Server, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { SectionCard } from "@/components/app/section-card";
import { StatCard } from "@/components/app/stat-card";
import { StatusPill } from "@/components/app/status-pill";
import { platformMetrics } from "@/lib/demo-data";

const icons = [Database, ShieldCheck, Server, AlertTriangle];

export default function AdminPage() {
  return (
    <>
      <PageHeader
        eyebrow="Admin Oversight"
        title="Platform Health"
        description="System status, subscription health, workspace growth, and pending administrative actions."
      />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {platformMetrics.map((metric, index) => (
          <StatCard
            delta={metric.delta}
            icon={icons[index]}
            key={metric.label}
            label={metric.label}
            tone={index === 3 ? "error" : "secondary"}
            value={metric.value}
          />
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <SectionCard className="lg:col-span-2" title="System Integrity">
          <div className="mb-6">
            <StatusPill tone="success">All Systems Operational</StatusPill>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ["Core API Latency", "42ms", "15%", "Optimal"],
              ["Database Load", "68%", "68%", "Moderate"],
            ].map(([label, value, width, status]) => (
              <div className="rounded-lg border border-outline-variant/20 bg-surface p-4" key={label}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-semibold">{label}</span>
                  <span className="text-on-surface-variant">{value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-container-high">
                  <div className="h-full bg-secondary" style={{ width }} />
                </div>
                <p className="mt-3 text-right text-xs font-semibold text-on-surface-variant">{status}</p>
              </div>
            ))}
            <div className="rounded-lg border border-outline-variant/20 bg-surface p-4 md:col-span-2">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold">Object Storage Cluster</h3>
                  <p className="text-sm text-on-surface-variant">Private attachments bucket with signed URLs</p>
                </div>
                <div className="text-right">
                  <div className="font-heading text-xl font-semibold">14.2 TB</div>
                  <div className="text-xs text-on-surface-variant">of 50 TB allocated</div>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>
        <SectionCard title="Pending Actions">
          <div className="space-y-4">
            {[
              ["Review Suspended Account", "Workspace ID #8842 flagged for TOS violation.", "danger"],
              ["Enterprise KYC Approval", "Apex Property Group pending final sign-off.", "info"],
              ["Partner API Access", "Airbnb and VRBO connectors awaiting credentials.", "neutral"],
            ].map(([title, body, tone]) => (
              <div className="rounded-lg border border-transparent p-3 hover:border-outline-variant/30 hover:bg-surface" key={title}>
                <StatusPill tone={tone as "danger" | "info" | "neutral"}>{title}</StatusPill>
                <p className="mt-2 text-sm text-on-surface-variant">{body}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </>
  );
}
