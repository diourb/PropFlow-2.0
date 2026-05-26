import Link from "next/link";
import { Download, FileText, Search } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { DonutBreakdown, RevenueChart } from "@/components/app/simple-chart";
import { SectionCard } from "@/components/app/section-card";
import { StatCard } from "@/components/app/stat-card";
import { StatusPill } from "@/components/app/status-pill";
import { EmptyState } from "@/components/app/empty-state";
import { getOperationsSnapshot, getOwnerStatementsRecord } from "@/lib/data/repository";
import { PdfDownloadButton } from "@/components/app/pdf-download-button";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ property?: string; q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const query = (params.q ?? "").toLowerCase().trim();
  const propertyFilter = params.property ?? "";
  const statusFilter = params.status ?? "";
  const { maintenanceRequests, properties } = await getOperationsSnapshot();
  const ownerStatements = await getOwnerStatementsRecord();

  const visibleProperties = properties.filter((property) => {
    if (propertyFilter && property.name !== propertyFilter) return false;
    if (statusFilter && property.status !== statusFilter) return false;
    if (
      query &&
      !property.name.toLowerCase().includes(query) &&
      !property.owner.toLowerCase().includes(query) &&
      !property.location.toLowerCase().includes(query)
    ) {
      return false;
    }
    return true;
  });
  const totalRevenue = properties.reduce((sum, property) => sum + property.revenueYtd, 0);
  const averageOccupancy = properties.length
    ? Math.round(properties.reduce((sum, property) => sum + property.occupancy, 0) / properties.length)
    : 0;
  const operationalCosts = ownerStatements.reduce((sum, statement) => sum + statement.expenses, 0);

  return (
    <>
      <PageHeader
        action={
          <div className="flex flex-wrap gap-3">
            <a
              className="flex h-11 items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 text-sm font-semibold"
              href="/api/exports/csv"
            >
              <Download size={17} />
              Export CSV
            </a>
            <PdfDownloadButton />
          </div>
        }
        title="Reports Overview"
        description="High-level financial and operational insights across active properties."
      />
      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <StatCard label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} delta={`${properties.length} properties`} />
        <StatCard label="Avg Occupancy" value={`${averageOccupancy}%`} delta="Across active assets" tone="primary" />
        <StatCard label="Operational Costs" value={`$${operationalCosts.toLocaleString()}`} delta={`${maintenanceRequests.length} work orders`} tone="error" />
      </div>
      <form className="mb-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 ambient-shadow">
        <div className="flex flex-wrap gap-3">
          <input className="h-10 rounded-lg border border-outline-variant bg-surface px-3 text-sm" defaultValue={query} name="q" placeholder="Search property, owner, location" />
          <select className="h-10 rounded-lg border border-outline-variant bg-surface px-3 text-sm" defaultValue={propertyFilter} name="property">
            <option value="">All properties</option>
            {properties.map((property) => <option key={property.id} value={property.name}>{property.name}</option>)}
          </select>
          <select className="h-10 rounded-lg border border-outline-variant bg-surface px-3 text-sm" defaultValue={statusFilter} name="status">
            <option value="">All statuses</option>
            {["Occupied", "Cleaning", "Vacant", "Maintenance"].map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
          <button className="h-10 rounded-lg bg-primary-container px-4 text-sm font-semibold text-on-primary">Generate report</button>
          {(query || propertyFilter || statusFilter) ? (
            <Link className="flex h-10 items-center rounded-lg border border-outline-variant px-4 text-sm font-semibold" href="/reports">Clear</Link>
          ) : null}
        </div>
      </form>
      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard className="lg:col-span-2" title="Revenue vs Projections">
          <RevenueChart />
        </SectionCard>
        <SectionCard title="OpEx Breakdown">
          <DonutBreakdown />
        </SectionCard>
      </div>
      <SectionCard className="mt-6" title="Top Performing Properties">
        {visibleProperties.length === 0 ? (
          <div className="py-8">
            <EmptyState
              title="No properties match"
              description="Try adjusting your filters to find specific properties in your portfolio."
              icon={Search}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-surface-container-low text-xs uppercase text-outline">
                <tr>
                  <th className="p-4">Property</th>
                  <th className="p-4">Occupancy</th>
                  <th className="p-4">Revenue</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {visibleProperties.slice(0, 8).map((property) => (
                  <tr key={property.id}>
                    <td className="p-4 font-semibold">{property.name}</td>
                    <td className="p-4">{property.occupancy}%</td>
                    <td className="p-4">${property.revenueYtd.toLocaleString()}</td>
                    <td className="p-4">{property.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <SectionCard className="mt-6" title="Owner Statements">
        {ownerStatements.length === 0 ? (
          <div className="py-8">
            <EmptyState
              title="No owner statements yet"
              description="Statements will appear here once owners are added and revenue is generated."
              icon={FileText}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-surface-container-low text-xs uppercase text-outline">
                <tr>
                  <th className="p-4">Owner</th>
                  <th className="p-4">Revenue</th>
                  <th className="p-4">Expenses</th>
                  <th className="p-4">Payout</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {ownerStatements.map((statement) => (
                  <tr key={statement.id}>
                    <td className="p-4 font-semibold">{statement.owner}</td>
                    <td className="p-4">${statement.revenue.toLocaleString()}</td>
                    <td className="p-4 text-error">${statement.expenses.toLocaleString()}</td>
                    <td className="p-4 font-semibold text-secondary">${statement.payout.toLocaleString()}</td>
                    <td className="p-4">
                      <StatusPill
                        tone={
                          statement.status === "sent"
                            ? "success"
                            : statement.status === "ready"
                              ? "info"
                              : "neutral"
                        }
                      >
                        {statement.status}
                      </StatusPill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </>
  );
}
