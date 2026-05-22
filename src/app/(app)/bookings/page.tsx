import Link from "next/link";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { StatusPill } from "@/components/app/status-pill";
import { BookingCreateDialog, BookingRowActions } from "@/components/workflows/operation-dialogs";
import { getOperationsSnapshot } from "@/lib/data/repository";

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string; platform?: string; q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const query = (params.q ?? "").toLowerCase().trim();
  const paymentFilter = params.payment ?? "";
  const platformFilter = params.platform ?? "";
  const statusFilter = params.status ?? "";

  const { bookings, properties } = await getOperationsSnapshot();

  const filteredBookings = bookings
    .filter((b) => {
      if (!query) return true;
      return (
        b.guest.toLowerCase().includes(query) ||
        b.email.toLowerCase().includes(query) ||
        b.property.toLowerCase().includes(query)
      );
    })
    .filter((b) => !platformFilter || b.platform.toLowerCase() === platformFilter.toLowerCase())
    .filter((b) => !paymentFilter || b.payment.toLowerCase().replace(/\s+/g, "") === paymentFilter)
    .filter((b) =>
      !statusFilter ||
      b.status.toLowerCase().replace(/[^a-z]/g, "") === statusFilter.toLowerCase().replace(/[^a-z]/g, ""),
    );

  return (
    <>
      <PageHeader
        action={
          <div className="flex gap-3">
            <Link
              className="flex h-11 items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 text-sm font-semibold"
              href="/api/exports/csv"
            >
              <Download size={17} />
              Export Data
            </Link>
            <BookingCreateDialog properties={properties} />
          </div>
        }
        title="Bookings Management"
        description="Current and upcoming short-term reservations plus long-term lease occupancy."
      />

      <form className="mb-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 ambient-shadow" method="GET">
        <div className="flex flex-wrap gap-3">
          <input
            className="h-10 rounded-lg border border-outline-variant bg-surface px-3 text-sm"
            defaultValue={query}
            name="q"
            placeholder="Search guest, contact, property"
          />
          <select
            className="h-10 rounded-lg border border-outline-variant bg-surface px-3 text-sm"
            defaultValue={platformFilter}
            name="platform"
          >
            <option value="">All Platforms</option>
            <option value="airbnb">Airbnb</option>
            <option value="vrbo">VRBO</option>
            <option value="direct">Direct</option>
            <option value="lease">Lease</option>
          </select>
          <select
            className="h-10 rounded-lg border border-outline-variant bg-surface px-3 text-sm"
            defaultValue={paymentFilter}
            name="payment"
          >
            <option value="">All Payments</option>
            <option value="unpaid">Unpaid</option>
            <option value="partial">Deposit paid</option>
            <option value="paid">Paid</option>
          </select>
          <select
            className="h-10 rounded-lg border border-outline-variant bg-surface px-3 text-sm"
            defaultValue={statusFilter}
            name="status"
          >
            <option value="">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="checkedin">Checked-in</option>
            <option value="checkedout">Checked-out</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            className="h-10 rounded-lg bg-primary-container px-4 text-sm font-semibold text-on-primary"
            type="submit"
          >
            Filter
          </button>
          {(query || paymentFilter || platformFilter || statusFilter) ? (
            <Link
              className="flex h-10 items-center rounded-lg border border-outline-variant px-4 text-sm font-semibold"
              href="/bookings"
            >
              Clear
            </Link>
          ) : null}
        </div>
      </form>

      <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest ambient-shadow">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="bg-surface-container-low text-xs uppercase tracking-wide text-on-surface-variant">
              <tr>
                {["Guest", "Property", "Stay Dates", "Platform", "Payment", "Status", "Amount", "Actions"].map((h) => (
                  <th className="px-4 py-3 font-semibold" key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-on-surface-variant" colSpan={8}>
                    No bookings match the current filters.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr className="hover:bg-surface-bright" key={booking.id}>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-container text-xs font-semibold text-on-primary">
                          {booking.guest.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                        </span>
                        <span>
                          <span className="block font-semibold">{booking.guest}</span>
                          <span className="text-xs text-on-surface-variant">{booking.email}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-semibold">{booking.property}</td>
                    <td className="px-4 py-4">
                      <span className="block">{booking.stayDates}</span>
                      <span className="text-xs text-on-surface-variant">{booking.nights} nights</span>
                    </td>
                    <td className="px-4 py-4">{booking.platform}</td>
                    <td className="px-4 py-4">
                      <StatusPill tone={booking.payment === "Paid" ? "success" : booking.payment === "Unpaid" ? "danger" : "neutral"}>
                        {booking.payment === "Partial" ? "Deposit paid" : booking.payment}
                      </StatusPill>
                    </td>
                    <td className="px-4 py-4">
                      <StatusPill
                        tone={
                          booking.status === "Checked-in" ? "success"
                            : booking.status === "Cancelled" ? "danger"
                            : booking.status === "Confirmed" ? "info"
                            : "neutral"
                        }
                      >
                        {booking.status}
                      </StatusPill>
                    </td>
                    <td className="px-4 py-4 font-semibold">${booking.amount.toLocaleString()}</td>
                    <td className="px-4 py-4">
                      <BookingRowActions booking={booking} properties={properties} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
