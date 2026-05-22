import Link from "next/link";
import Image from "next/image";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { StatusPill } from "@/components/app/status-pill";
import { PropertyCreateDialog, PropertyEditDialog } from "@/components/workflows/operation-dialogs";
import { getOperationsSnapshot } from "@/lib/data/repository";
import type { PropertyStatus } from "@/lib/types";

const statusOptions: Array<{ value: PropertyStatus | ""; label: string }> = [
  { value: "", label: "All Statuses" },
  { value: "Vacant", label: "Vacant" },
  { value: "Occupied", label: "Occupied" },
  { value: "Cleaning", label: "Cleaning" },
  { value: "Maintenance", label: "Maintenance" },
];

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const statusFilter = params.status ?? "";
  const query = (params.q ?? "").toLowerCase().trim();
  const { properties } = await getOperationsSnapshot();

  const filteredProperties = properties.filter((p) => {
    if (statusFilter && p.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (query && !p.name.toLowerCase().includes(query) && !p.location.toLowerCase().includes(query) && !p.owner.toLowerCase().includes(query)) return false;
    return true;
  });

  return (
    <>
      <PageHeader
        action={<PropertyCreateDialog />}
        title="Properties"
        description="Manage and monitor short-term, long-term, and mixed rental assets."
      />

      <form className="mb-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 ambient-shadow" method="GET">
        <div className="flex flex-wrap gap-3">
          <input
            className="h-10 rounded-lg border border-outline-variant bg-surface px-3 text-sm"
            defaultValue={query}
            name="q"
            placeholder="Search by name, location, owner…"
          />
          <select
            className="h-10 rounded-lg border border-outline-variant bg-surface px-3 text-sm"
            defaultValue={statusFilter}
            name="status"
          >
            {statusOptions.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <button className="h-10 rounded-lg bg-primary-container px-4 text-sm font-semibold text-on-primary" type="submit">
            Filter
          </button>
          {(statusFilter || query) ? (
            <Link className="flex h-10 items-center rounded-lg border border-outline-variant px-4 text-sm font-semibold" href="/properties">
              Clear
            </Link>
          ) : null}
        </div>
      </form>

      {filteredProperties.length === 0 ? (
        <div className="rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest p-10 text-center ambient-shadow">
          {properties.length === 0 ? (
            <>
              <h2 className="font-heading text-2xl font-semibold text-primary">No properties yet</h2>
              <p className="mt-2 text-sm text-on-surface-variant">
                Add the first property to unlock bookings, tasks, owner statements, and reports.
              </p>
              <div className="mt-6 flex justify-center">
                <PropertyCreateDialog />
              </div>
            </>
          ) : (
            <>
              <h2 className="font-heading text-2xl font-semibold text-primary">No properties match</h2>
              <p className="mt-2 text-sm text-on-surface-variant">Try a different status filter.</p>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredProperties.map((property) => (
            <article
              className="overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest ambient-shadow transition hover:-translate-y-1"
              key={property.id}
            >
              <Link href={`/properties/${property.id}`}>
                <div className="relative h-52 bg-surface-container-high">
                  <Image
                    alt={property.name}
                    className="object-cover"
                    fill
                    sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                    src={property.image}
                  />
                  <div className="absolute right-4 top-4">
                    <StatusPill
                      tone={
                        property.status === "Maintenance" ? "danger"
                          : property.status === "Vacant" ? "success"
                          : "info"
                      }
                    >
                      {property.status}
                    </StatusPill>
                  </div>
                </div>
              </Link>
              <div className="p-6">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <h2 className="font-heading text-xl font-semibold text-primary">
                    <Link className="hover:underline" href={`/properties/${property.id}`}>{property.name}</Link>
                  </h2>
                  <span className="shrink-0 text-sm text-on-surface-variant">{property.occupancy}% Occ.</span>
                </div>
                <p className="mb-5 flex items-center gap-1 text-sm text-on-surface-variant">
                  <MapPin size={16} />
                  {property.location}
                </p>
                <div className="border-t border-outline-variant/40 pt-4">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wide text-outline">
                    Owner: {property.owner}
                  </p>
                  <div className="flex gap-2">
                    <Link
                      className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-outline-variant text-sm font-semibold text-on-surface hover:bg-surface-container-low"
                      href={`/properties/${property.id}?tab=calendar`}
                    >
                      <CalendarDays size={16} />
                      Calendar
                    </Link>
                    <Link
                      aria-label="Team members"
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-low"
                      href="/settings/workspace?tab=team"
                      title="Team members"
                    >
                      <Users size={16} />
                    </Link>
                    <PropertyEditDialog property={property} />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
