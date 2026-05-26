import Link from "next/link";
import {
  Banknote,
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Hammer,
  Home,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { RevenueChart } from "@/components/app/simple-chart";
import { SectionCard } from "@/components/app/section-card";
import { StatCard } from "@/components/app/stat-card";
import { StatusPill } from "@/components/app/status-pill";
import { EmptyState } from "@/components/app/empty-state";
import { getOperationsSnapshot } from "@/lib/data/repository";

const icons = [TrendingUp, Banknote, Home, CheckCircle2];
const statLinks = ["/reports", "/maintenance", "/properties", "/settings/account"];

export default async function DashboardPage() {
  const {
    bookings,
    cleaningTasks,
    maintenanceRequests,
    properties,
  } = await getOperationsSnapshot();

  if (properties.length === 0) {
    return (
      <>
        <PageHeader
          title="Welcome to PropFlow"
          description="Get started by adding your first property to monitor portfolio performance."
        />
        <div className="mt-12">
          <EmptyState
            title="No properties found"
            description="Your dashboard is empty because you haven't added any properties yet. Once you add properties, you'll see revenue, occupancy, and operations health here."
            icon={Building2}
            action={
              <Link
                className="flex h-11 items-center rounded-lg bg-secondary px-6 text-sm font-semibold text-on-secondary hover:bg-secondary-fixed"
                href="/properties"
              >
                Add Your First Property
              </Link>
            }
          />
        </div>
      </>
    );
  }
  const totalRevenue = properties.reduce((sum, property) => sum + property.revenueYtd, 0);
  const averageOccupancy = properties.length
    ? Math.round(properties.reduce((sum, property) => sum + property.occupancy, 0) / properties.length)
    : 0;
  const estimatedExpenses = Math.round(totalRevenue * 0.28);
  const netProfit = totalRevenue - estimatedExpenses;
  const urgentWork = maintenanceRequests.filter((request) => request.status === "urgent").length;
  const overdueCleaning = cleaningTasks.filter((task) => task.status !== "completed").length;
  const opsHealth = Math.max(55, Math.min(99, 100 - urgentWork * 8 - overdueCleaning * 2));
  const dashboardMetrics = [
    { label: "Gross Revenue", value: `$${totalRevenue.toLocaleString()}`, delta: `${properties.length} active properties` },
    { label: "Net Profit", value: `$${netProfit.toLocaleString()}`, delta: `${estimatedExpenses.toLocaleString()} est. expenses` },
    { label: "Occupancy Rate", value: `${averageOccupancy}%`, delta: "Across mixed portfolio" },
    { label: "Ops Health", value: `${opsHealth}/100`, delta: `${urgentWork} urgent, ${overdueCleaning} cleaning` },
  ];

  return (
    <>
      <PageHeader
        title="Overview"
        description="Monitor portfolio performance and daily operations across mixed rental assets."
      />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {dashboardMetrics.map((metric, index) => (
          <Link className="block" href={statLinks[index]} key={metric.label}>
            <StatCard
              delta={metric.delta}
              icon={icons[index]}
              label={metric.label}
              tone={index === 2 ? "neutral" : "secondary"}
              value={metric.value}
            />
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <SectionCard className="lg:col-span-2" title="Revenue vs Expenses">
          <RevenueChart />
        </SectionCard>
        <div className="space-y-6">
          <SectionCard title="Today's Operations">
            <div className="space-y-4">
              <Link
                className="flex items-center justify-between rounded-lg border border-outline-variant/20 bg-surface-container-low p-4 transition hover:border-secondary/30 hover:bg-surface-container"
                href="/cleaning"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
                    <Building2 size={19} />
                  </span>
                  <div>
                    <p className="font-heading text-2xl font-semibold text-primary">
                      {cleaningTasks.length}
                    </p>
                    <p className="text-xs font-semibold text-on-surface-variant">
                      Cleanings Scheduled
                    </p>
                  </div>
                </div>
                <TrendingUp className="text-secondary" size={18} />
              </Link>
              <Link
                className="flex items-center justify-between rounded-lg border border-error/20 bg-error-container/30 p-4 transition hover:border-error/40 hover:bg-error-container/40"
                href="/maintenance"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-error-container text-on-error-container">
                    <Hammer size={19} />
                  </span>
                  <div>
                    <p className="font-heading text-2xl font-semibold text-error">
                      {urgentWork}
                    </p>
                    <p className="text-xs font-semibold text-on-surface-variant">
                      Urgent Work Orders
                    </p>
                  </div>
                </div>
                <TrendingUp className="text-error" size={18} />
              </Link>
            </div>
          </SectionCard>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <SectionCard
          action={
            <Link
              className="flex h-9 items-center rounded-lg bg-secondary px-4 text-sm font-semibold text-on-secondary hover:bg-secondary-fixed"
              href="/bookings"
            >
              View All
            </Link>
          }
          title="Upcoming Check-ins"
        >
          {bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.slice(0, 5).map((booking) => (
                <Link
                  className="flex items-center justify-between gap-4 border-b border-outline-variant/20 pb-4 last:border-0 last:pb-0 hover:opacity-80"
                  href="/bookings"
                  key={booking.id}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high font-heading font-semibold text-primary">
                      {booking.guest
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-on-surface">
                        {booking.guest}
                      </p>
                      <p className="text-sm text-on-surface-variant">
                        {booking.property} - {booking.nights} nights
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-on-surface">
                      {booking.stayDates}
                    </p>
                    <StatusPill tone="success">{booking.status}</StatusPill>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No upcoming bookings"
              description="You don't have any bookings scheduled for the next few days."
              icon={Calendar}
            />
          )}
        </SectionCard>

        <SectionCard
          action={
            <Link
              className="flex h-9 items-center rounded-lg bg-secondary px-4 text-sm font-semibold text-on-secondary hover:bg-secondary-fixed"
              href="/properties"
            >
              View All
            </Link>
          }
          title="Top Properties"
        >
          {properties.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/30 text-xs uppercase text-on-surface-variant">
                    <th className="py-3 font-semibold">Property</th>
                    <th className="py-3 font-semibold">Revenue</th>
                    <th className="py-3 font-semibold">Occupancy</th>
                    <th className="py-3 text-right font-semibold">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.slice(0, 5).map((property) => (
                    <tr
                      className="border-b border-outline-variant/10 last:border-0 hover:bg-surface-container-low"
                      key={property.id}
                    >
                      <td className="py-4 font-semibold text-on-surface">
                        <Link
                          className="hover:text-primary hover:underline"
                          href={`/properties/${property.id}`}
                        >
                          {property.name}
                        </Link>
                      </td>
                      <td className="py-4 text-on-surface-variant">
                        ${property.revenueYtd.toLocaleString()}
                      </td>
                      <td className="py-4 text-on-surface-variant">
                        {property.occupancy}%
                      </td>
                      <td className="py-4 text-right text-secondary">
                        <TrendingUp size={17} className="ml-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No property data"
              description="Add properties and start tracking bookings to see performance data here."
              icon={ClipboardList}
            />
          )}
        </SectionCard>
      </div>
    </>
  );
}
