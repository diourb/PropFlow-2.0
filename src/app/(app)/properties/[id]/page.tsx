import Link from "next/link";
import { Bath, BedDouble, MapPin, Square, Star, Wifi } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { SectionCard } from "@/components/app/section-card";
import { StatusPill } from "@/components/app/status-pill";
import { PropertyEditDialog } from "@/components/workflows/operation-dialogs";
import {
  OwnershipActions,
  PropertyCalendar,
  PropertyFinancials,
  PropertyHero,
  ViewListingButton,
} from "@/components/workflows/property-detail-client";
import { getOperationsSnapshot } from "@/lib/data/repository";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "calendar", label: "Calendar" },
  { id: "bookings", label: "Bookings" },
  { id: "cleaning", label: "Cleaning" },
  { id: "maintenance", label: "Maintenance" },
  { id: "financials", label: "Financials" },
];

export default async function PropertyProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab = "overview" } = await searchParams;
  const { properties, bookings, cleaningTasks, maintenanceRequests, owners } =
    await getOperationsSnapshot();
  const property = properties.find((item) => item.id === id);

  if (!property) {
    return (
      <SectionCard title="Property not found">
        <p className="text-sm text-on-surface-variant">
          This property does not exist or you do not have access.{" "}
          <Link className="font-semibold text-primary" href="/properties">
            View all properties
          </Link>
        </p>
      </SectionCard>
    );
  }

  const propertyBookings = bookings.filter((b) => b.property === property.name);
  const propertyTasks = cleaningTasks.filter((t) => t.property === property.name);
  const propertyMaintenance = maintenanceRequests.filter((m) => m.property === property.name);
  const owner = owners.find((item) => item.name === property.owner);

  return (
    <>
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
        <Link className="hover:text-primary" href="/properties">Properties</Link>
        <span>/</span>
        <span className="text-primary">{property.name}</span>
      </div>

      <PageHeader
        action={
          <div className="flex gap-3">
            <ViewListingButton address={property.address} name={property.name} />
            <PropertyEditDialog property={property} variant="button" />
          </div>
        }
        title={property.name}
        description={property.address}
      />

      {/* Hero image with photo upload */}
      <PropertyHero
        address={property.address}
        alt={property.name}
        propertyId={id}
        src={property.image}
        status={property.status}
      />

      {/* Tabs */}
      <div className="mb-8 flex gap-6 overflow-x-auto border-b border-outline-variant">
        {tabs.map(({ id: tabId, label }) => (
          <Link
            className={`shrink-0 border-b-2 py-4 text-sm font-semibold transition ${
              tabId === tab
                ? "border-secondary text-secondary"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
            href={`/properties/${id}?tab=${tabId}`}
            key={tabId}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <div className="grid gap-4 md:grid-cols-3">
              {[
                ["YTD Revenue", `$${property.revenueYtd.toLocaleString()}`, "12%"],
                ["Occupancy Rate", `${property.occupancy}%`, "Target: 80%"],
                ["Guest Rating", property.rating.toFixed(2), "(128 reviews)"],
              ].map(([label, value, extra]) => (
                <div className="rounded-xl border border-outline-variant/50 bg-surface-container-lowest p-5 ambient-shadow" key={label}>
                  <span className="text-xs font-semibold text-on-surface-variant">{label}</span>
                  <div className="mt-3 flex items-end gap-2">
                    <span className="font-heading text-2xl font-bold text-on-surface">{value}</span>
                    <span className="mb-1 text-xs font-semibold text-secondary">{extra}</span>
                  </div>
                </div>
              ))}
            </div>
            <SectionCard title="Property Specifications">
              <div className="mb-6 flex flex-wrap gap-8 border-b border-outline-variant/50 pb-6">
                {[
                  [BedDouble, "Bedrooms", `${property.bedrooms} (Sleeps ${property.bedrooms * 2})`],
                  [Bath, "Bathrooms", String(property.bathrooms)],
                  [Square, "Area", property.area],
                ].map(([Icon, label, value]) => (
                  <div className="flex items-center gap-3" key={String(label)}>
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-low text-primary-container">
                      <Icon size={20} />
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-on-surface-variant">{String(label)}</p>
                      <p className="text-sm font-semibold text-on-surface">{String(value)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <h3 className="mb-3 text-sm font-semibold text-on-surface">Key Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {["Private Pool", "Gigabit WiFi", "Central AC", "2 Car Garage"].map((amenity, index) => (
                  <span
                    className="flex items-center gap-1 rounded-md border border-outline-variant/30 bg-surface-container px-3 py-1.5 text-xs font-semibold"
                    key={amenity}
                  >
                    {index === 1 ? <Wifi size={14} /> : <Star size={14} />}
                    {amenity}
                  </span>
                ))}
              </div>
            </SectionCard>
          </div>
          <div className="space-y-6 lg:col-span-4">
            <SectionCard title="Location">
              <a
                className="block"
                href={`https://maps.google.com/?q=${encodeURIComponent(property.address)}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                <div className="relative h-52 overflow-hidden rounded-lg border border-outline-variant/20 bg-surface-container-high transition hover:opacity-90">
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,#e2e7ff_25%,#ffffff_25%,#ffffff_50%,#e2e7ff_50%,#e2e7ff_75%,#ffffff_75%)] bg-[length:40px_40px] opacity-70" />
                  <MapPin
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-container drop-shadow"
                    size={42}
                  />
                  <span className="absolute bottom-2 right-2 rounded bg-surface-container-lowest/90 px-2 py-1 text-xs font-semibold text-on-surface">
                    Open in Maps ↗
                  </span>
                </div>
              </a>
            </SectionCard>
            <SectionCard title="Ownership">
              <div className="mb-4 flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-high font-heading font-semibold">
                  {property.owner.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                </span>
                <div>
                  <p className="font-semibold text-on-surface">{property.owner}</p>
                  <StatusPill tone="success">Active Owner</StatusPill>
                </div>
              </div>
              <OwnershipActions
                email={owner?.email}
                ownerName={property.owner}
                phone={owner?.phone}
              />
            </SectionCard>
          </div>
        </div>
      )}

      {/* ── Calendar ── */}
      {tab === "calendar" && (
        <SectionCard title="Availability Calendar">
          <PropertyCalendar bookings={propertyBookings} />
        </SectionCard>
      )}

      {/* ── Bookings ── */}
      {tab === "bookings" && (
        <SectionCard
          action={
            <Link className="text-sm font-semibold text-secondary hover:underline" href="/bookings">
              Manage All Bookings
            </Link>
          }
          title="Bookings"
        >
          {propertyBookings.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-sm text-on-surface-variant">No bookings for this property yet.</p>
              <Link className="mt-3 inline-flex h-9 items-center gap-2 rounded-lg bg-primary-container px-4 text-sm font-semibold text-on-primary" href="/bookings">
                Add Booking
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {propertyBookings.map((booking) => (
                <div
                  className="flex items-center justify-between rounded-lg border border-outline-variant/30 p-4 hover:bg-surface-container-low"
                  key={booking.id}
                >
                  <div>
                    <p className="font-semibold text-primary">{booking.guest}</p>
                    <p className="text-sm text-on-surface-variant">{booking.stayDates} · {booking.platform}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-semibold">${booking.amount.toLocaleString()}</p>
                    <StatusPill
                      tone={
                        booking.status === "Checked-in" ? "success"
                          : booking.status === "Cancelled" ? "danger"
                          : "neutral"
                      }
                    >
                      {booking.status}
                    </StatusPill>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      )}

      {/* ── Cleaning ── */}
      {tab === "cleaning" && (
        <SectionCard
          action={
            <Link className="text-sm font-semibold text-secondary hover:underline" href="/cleaning">
              Open Cleaning Dashboard
            </Link>
          }
          title="Cleaning Tasks"
        >
          {propertyTasks.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-sm text-on-surface-variant">No cleaning tasks for this property.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {propertyTasks.map((task) => (
                <div
                  className="flex items-center justify-between rounded-lg border border-outline-variant/30 p-4"
                  key={task.id}
                >
                  <div>
                    <p className="font-semibold text-primary">{task.type}</p>
                    <p className="text-sm text-on-surface-variant">Check-in {task.checkIn}</p>
                  </div>
                  <div className="text-right text-sm">
                    <StatusPill
                      tone={task.status === "completed" ? "success" : task.status === "in_progress" ? "info" : "neutral"}
                    >
                      {task.status.replace("_", " ")}
                    </StatusPill>
                    <p className="mt-1 text-on-surface-variant">{task.completed}/{task.total} items</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      )}

      {/* ── Maintenance ── */}
      {tab === "maintenance" && (
        <SectionCard
          action={
            <Link className="text-sm font-semibold text-secondary hover:underline" href="/maintenance">
              Open Maintenance Board
            </Link>
          }
          title="Maintenance Requests"
        >
          {propertyMaintenance.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-sm text-on-surface-variant">No maintenance requests for this property.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {propertyMaintenance.map((request) => (
                <div
                  className="flex items-center justify-between rounded-lg border border-outline-variant/30 p-4"
                  key={request.id}
                >
                  <div>
                    <p className="font-semibold text-primary">{request.title}</p>
                    <p className="text-sm text-on-surface-variant">{request.priority} · {request.reportedAgo}</p>
                  </div>
                  <StatusPill
                    tone={
                      request.status === "completed" ? "success"
                        : request.status === "urgent" ? "danger"
                        : "neutral"
                    }
                  >
                    {request.status.replace("_", " ")}
                  </StatusPill>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      )}

      {/* ── Financials ── */}
      {tab === "financials" && (
        <SectionCard title="Financial Summary">
          <PropertyFinancials maintenanceRequests={propertyMaintenance} property={property} />
        </SectionCard>
      )}
    </>
  );
}
