import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { SectionCard } from "@/components/app/section-card";
import { StatusPill } from "@/components/app/status-pill";
import { getOperationsSnapshot } from "@/lib/data/repository";

const views = ["month", "week", "day"] as const;

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ property?: string; type?: string; view?: string }>;
}) {
  const params = await searchParams;
  const view = views.includes(params.view as (typeof views)[number])
    ? (params.view as (typeof views)[number])
    : "month";
  const propertyFilter = params.property ?? "";
  const typeFilter = params.type ?? "";
  const { bookings, cleaningTasks, maintenanceRequests, properties } =
    await getOperationsSnapshot();

  const events = [
    ...bookings.map((booking) => ({
      id: booking.id,
      type: "booking",
      title: `${booking.guest} stay`,
      property: booking.property,
      time: booking.stayDates,
      href: "/bookings",
      status: booking.status,
      tone: booking.status === "Cancelled" ? "danger" : "info",
    })),
    ...cleaningTasks.map((task) => ({
      id: task.id,
      type: "cleaning",
      title: task.type,
      property: task.property,
      time: `Check-in ${task.checkIn}`,
      href: "/cleaning",
      status: task.status.replace(/_/g, " "),
      tone: task.status === "completed" ? "success" : "neutral",
    })),
    ...maintenanceRequests.map((request) => ({
      id: request.id,
      type: "maintenance",
      title: request.title,
      property: request.property,
      time: request.reportedAgo,
      href: "/maintenance",
      status: request.status.replace(/_/g, " "),
      tone: request.status === "urgent" ? "danger" : request.status === "completed" ? "success" : "neutral",
    })),
  ].filter((event) => {
    if (propertyFilter && event.property !== propertyFilter) return false;
    if (typeFilter && event.type !== typeFilter) return false;
    return true;
  });

  return (
    <>
      <PageHeader
        action={
          <Link
            className="flex h-11 items-center gap-2 rounded-lg bg-primary-container px-4 text-sm font-semibold text-on-primary"
            href="/bookings"
          >
            <CalendarDays size={17} />
            Add Booking
          </Link>
        }
        title="Operations Calendar"
        description="Bookings, turnovers, check-ins, cleaning tasks, and maintenance work in one schedule."
      />

      <form className="mb-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 ambient-shadow">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-lg border border-outline-variant bg-surface p-1">
            {views.map((item) => (
              <Link
                className={`rounded-md px-3 py-2 text-xs font-semibold capitalize ${
                  view === item ? "bg-primary-container text-on-primary" : "text-on-surface-variant"
                }`}
                href={`/calendar?view=${item}&property=${encodeURIComponent(propertyFilter)}&type=${encodeURIComponent(typeFilter)}`}
                key={item}
              >
                {item}
              </Link>
            ))}
          </div>
          <select
            className="h-10 rounded-lg border border-outline-variant bg-surface px-3 text-sm"
            defaultValue={propertyFilter}
            name="property"
          >
            <option value="">All properties</option>
            {properties.map((property) => (
              <option key={property.id} value={property.name}>
                {property.name}
              </option>
            ))}
          </select>
          <select
            className="h-10 rounded-lg border border-outline-variant bg-surface px-3 text-sm"
            defaultValue={typeFilter}
            name="type"
          >
            <option value="">All work</option>
            <option value="booking">Bookings</option>
            <option value="cleaning">Cleaning</option>
            <option value="maintenance">Maintenance</option>
          </select>
          <input name="view" type="hidden" value={view} />
          <button className="h-10 rounded-lg bg-primary-container px-4 text-sm font-semibold text-on-primary">
            Filter
          </button>
          {(propertyFilter || typeFilter) ? (
            <Link
              className="flex h-10 items-center rounded-lg border border-outline-variant px-4 text-sm font-semibold"
              href={`/calendar?view=${view}`}
            >
              Clear
            </Link>
          ) : null}
        </div>
      </form>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <SectionCard
          action={
            <div className="flex gap-2">
              <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant" type="button">
                <ChevronLeft size={17} />
              </button>
              <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant" type="button">
                <ChevronRight size={17} />
              </button>
            </div>
          }
          title={`This ${view}`}
        >
          {events.length === 0 ? (
            <div className="rounded-xl border border-dashed border-outline-variant p-10 text-center">
              <Sparkles className="mx-auto mb-3 text-outline" size={28} />
              <h2 className="font-heading text-xl font-semibold text-primary">
                Nothing scheduled
              </h2>
              <p className="mt-2 text-sm text-on-surface-variant">
                Add a booking, cleaning task, or work order to populate the calendar.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {events.map((event) => (
                <Link
                  className="rounded-lg border border-outline-variant/40 bg-surface p-4 transition hover:border-secondary/50 hover:bg-surface-container-low"
                  href={event.href}
                  key={`${event.type}-${event.id}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">
                        {event.type}
                      </p>
                      <h2 className="mt-1 font-heading text-lg font-semibold text-primary">
                        {event.title}
                      </h2>
                    </div>
                    <StatusPill tone={event.tone as "danger" | "info" | "neutral" | "success"}>
                      {event.status}
                    </StatusPill>
                  </div>
                  <p className="mt-3 text-sm text-on-surface-variant">
                    {event.property} - {event.time}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Quick Add">
          <div className="grid gap-3">
            <Link className="h-10 rounded-lg bg-primary-container px-4 py-2 text-center text-sm font-semibold text-on-primary" href="/bookings">
              Add booking
            </Link>
            <Link className="h-10 rounded-lg border border-outline-variant px-4 py-2 text-center text-sm font-semibold" href="/cleaning">
              Add cleaning task
            </Link>
            <Link className="h-10 rounded-lg border border-outline-variant px-4 py-2 text-center text-sm font-semibold" href="/maintenance">
              Add work order
            </Link>
          </div>
        </SectionCard>
      </div>
    </>
  );
}
