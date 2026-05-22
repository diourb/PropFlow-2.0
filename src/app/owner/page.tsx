import Link from "next/link";
import { redirect } from "next/navigation";
import { Download, FileText, Hammer, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { SectionCard } from "@/components/app/section-card";
import { StatusPill } from "@/components/app/status-pill";
import { getOperationsSnapshot } from "@/lib/data/repository";

export default async function OwnerPortalPage() {
  const snapshot = await getOperationsSnapshot();
  const allowed = ["platform_admin", "workspace_admin", "manager", "owner"];
  if (!allowed.includes(snapshot.session.role)) redirect("/dashboard");
  const visibleStatements = snapshot.ownerStatements.slice(0, 3);
  const scopedOwner = snapshot.session.role === "owner" ? visibleStatements[0]?.owner : null;
  const ownerProperties = scopedOwner
    ? snapshot.properties.filter((property) => property.owner === scopedOwner)
    : snapshot.properties;
  const ownerMaintenance = scopedOwner
    ? snapshot.maintenanceRequests.filter((request) =>
        ownerProperties.some((property) => property.name === request.property),
      )
    : snapshot.maintenanceRequests;

  return (
    <>
      <PageHeader
        action={
          <Link
            className="flex h-11 items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 text-sm font-semibold hover:bg-surface-container-low"
            href="/api/exports/csv"
          >
            <Download size={17} />
            Export CSV
          </Link>
        }
        title="Owner Portal"
        description="Portfolio performance, statements, and maintenance visibility."
      />

      {/* Summary stats */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        {[
          { label: "Total Revenue", value: `$${ownerProperties.reduce((s, p) => s + p.revenueYtd, 0).toLocaleString()}`, icon: TrendingUp },
          { label: "Properties", value: String(ownerProperties.length), icon: FileText },
          { label: "Open Work Orders", value: String(ownerMaintenance.filter((r) => r.status !== "completed" && r.status !== "cancelled").length), icon: Hammer },
        ].map(({ label, value, icon: Icon }) => (
          <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-5 ambient-shadow" key={label}>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
              <Icon size={18} />
            </span>
            <div>
              <p className="text-xs font-semibold text-on-surface-variant">{label}</p>
              <p className="font-heading text-2xl font-semibold text-primary">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Owner Statements */}
      <div className="grid gap-6 lg:grid-cols-3">
        {visibleStatements.map((statement) => (
          <SectionCard key={statement.id}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-heading text-xl font-semibold text-primary">{statement.owner}</h2>
                <p className="mt-1 text-sm text-on-surface-variant">{statement.properties} properties</p>
              </div>
              <StatusPill tone={statement.status === "ready" ? "success" : statement.status === "sent" ? "info" : "neutral"}>
                {statement.status}
              </StatusPill>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-surface-container-low p-3">
                <p className="text-xs font-semibold text-on-surface-variant">Revenue</p>
                <p className="font-heading text-xl font-semibold text-primary">${statement.revenue.toLocaleString()}</p>
              </div>
              <div className="rounded-lg bg-surface-container-low p-3">
                <p className="text-xs font-semibold text-on-surface-variant">Payout</p>
                <p className="font-heading text-xl font-semibold text-secondary">${statement.payout.toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <Link
                className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-outline-variant text-sm font-semibold hover:bg-surface-container-low"
                href="/reports"
              >
                <FileText size={16} />
                View Statement
              </Link>
              <Link
                className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-outline-variant text-sm font-semibold hover:bg-surface-container-low"
                href="/api/exports/csv"
              >
                <Download size={16} />
                Export
              </Link>
            </div>
          </SectionCard>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <SectionCard title="Owner Properties">
          <div className="space-y-3">
            {ownerProperties.slice(0, 5).map((property) => (
              <Link
                className="flex items-center justify-between rounded-lg border border-outline-variant/30 p-4 transition hover:bg-surface-container-low"
                href={`/properties/${property.id}`}
                key={property.id}
              >
                <div>
                  <p className="font-semibold text-primary">{property.name}</p>
                  <p className="text-sm text-on-surface-variant">{property.location} · {property.occupancy}% occ.</p>
                </div>
                <span className="text-sm font-semibold text-secondary">${property.revenueYtd.toLocaleString()}</span>
              </Link>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Maintenance Visibility">
          <div className="space-y-3">
            {ownerMaintenance.slice(0, 5).map((request) => (
              <Link
                className="block rounded-lg border border-outline-variant/30 p-4 transition hover:bg-surface-container-low"
                href="/maintenance"
                key={request.id}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="flex items-center gap-2 font-semibold text-primary">
                    <Hammer size={15} />
                    {request.title}
                  </p>
                  <StatusPill
                    tone={
                      request.status === "completed" ? "success"
                        : request.status === "urgent" ? "danger"
                        : "neutral"
                    }
                  >
                    {request.status.replace(/_/g, " ")}
                  </StatusPill>
                </div>
                <p className="mt-1 text-sm text-on-surface-variant">{request.property} · {request.reportedAgo}</p>
              </Link>
            ))}
          </div>
        </SectionCard>
      </div>
    </>
  );
}
