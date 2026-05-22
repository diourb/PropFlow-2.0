"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Mail, Phone } from "lucide-react";
import type { Booking, MaintenanceRequest, Property } from "@/lib/types";

/* ──── Calendar Tab ──── */
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function PropertyCalendar({
  bookings,
}: {
  bookings: Booking[];
}) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1,
  );

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  const bookedDays = new Set<number>();
  bookings.forEach((b) => {
    const dates = b.stayDates.split(" - ");
    if (dates.length === 2) {
      const start = new Date(dates[0] + ", " + year);
      const end = new Date(dates[1] + ", " + year);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          if (d.getFullYear() === year && d.getMonth() === month) {
            bookedDays.add(d.getDate());
          }
        }
      }
    }
  });

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-heading text-lg font-semibold text-primary">
          {MONTHS[month]} {year}
        </h3>
        <div className="flex gap-2">
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-low"
            onClick={prevMonth}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-low"
            onClick={nextMonth}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {DAYS.map((d) => (
          <div className="py-2 text-xs font-bold uppercase text-on-surface-variant" key={d}>{d}</div>
        ))}
        {cells.map((day, idx) => (
          <div
            className={`flex h-10 items-center justify-center rounded-lg text-sm font-semibold ${
              day === null
                ? ""
                : day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
                ? "bg-secondary text-on-secondary"
                : bookedDays.has(day)
                ? "bg-primary-container text-on-primary"
                : "text-on-surface hover:bg-surface-container-low"
            }`}
            key={idx}
          >
            {day ?? ""}
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-4 text-xs font-semibold text-on-surface-variant">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-secondary" />Today</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-primary-container" />Booked</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded border border-outline-variant" />Available</span>
      </div>

      {bookings.length > 0 && (
        <div className="mt-6 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">Upcoming Stays</h4>
          {bookings.slice(0, 4).map((b) => (
            <div className="flex items-center justify-between rounded-lg border border-outline-variant/30 p-3 text-sm" key={b.id}>
              <span className="font-semibold text-primary">{b.guest}</span>
              <span className="text-on-surface-variant">{b.stayDates}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ──── Financials Tab ──── */
export function PropertyFinancials({
  property,
  maintenanceRequests,
}: {
  property: Property;
  maintenanceRequests: MaintenanceRequest[];
}) {
  const monthlyRevenue = Math.round(property.revenueYtd / 10);
  const estimatedExpenses = Math.round(property.revenueYtd * 0.28);
  const netIncome = property.revenueYtd - estimatedExpenses;
  const maintenanceCosts = maintenanceRequests.filter((r) => r.estimate !== "TBD").length * 850;

  const rows = [
    { label: "Gross Revenue YTD", value: property.revenueYtd, positive: true },
    { label: "Estimated Operating Expenses (28%)", value: -estimatedExpenses, positive: false },
    { label: "Net Income YTD", value: netIncome, positive: netIncome >= 0 },
    { label: "Est. Monthly Revenue", value: monthlyRevenue, positive: true },
    { label: "Maintenance Spend (tracked)", value: -maintenanceCosts, positive: false },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Revenue YTD", value: `$${property.revenueYtd.toLocaleString()}`, sub: "Gross" },
          { label: "Net Profit Est.", value: `$${netIncome.toLocaleString()}`, sub: "After expenses" },
          { label: "Occupancy", value: `${property.occupancy}%`, sub: "Current rate" },
        ].map(({ label, value, sub }) => (
          <div className="rounded-xl border border-outline-variant/50 bg-surface-container-lowest p-5" key={label}>
            <p className="text-xs font-semibold text-on-surface-variant">{label}</p>
            <p className="mt-2 font-heading text-2xl font-bold text-primary">{value}</p>
            <p className="mt-1 text-xs text-on-surface-variant">{sub}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-outline-variant/30 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-container-low text-xs uppercase text-on-surface-variant">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Line Item</th>
              <th className="px-4 py-3 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30">
            {rows.map(({ label, value, positive }) => (
              <tr key={label}>
                <td className="px-4 py-3 font-medium text-on-surface">{label}</td>
                <td className={`px-4 py-3 text-right font-semibold ${positive ? "text-secondary" : "text-error"}`}>
                  {value < 0 ? `-$${Math.abs(value).toLocaleString()}` : `$${value.toLocaleString()}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-on-surface-variant">
        * Estimates based on industry averages. Connect QuickBooks in Integrations for live data.
      </p>

      <Link
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-outline-variant px-4 text-sm font-semibold hover:bg-surface-container-low"
        href="/api/exports/csv"
      >
        Export Financial Data
      </Link>
    </div>
  );
}

/* ──── Ownership Actions (Message / Call) ──── */
export function OwnershipActions({ ownerName }: { ownerName: string; address: string }) {
  const [modal, setModal] = useState<"map" | null>(null);

  return (
    <>
      <div className="flex gap-2">
        <a
          className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-outline-variant text-sm font-semibold hover:bg-surface-container-low"
          href={`mailto:`}
          title={`Email ${ownerName}`}
        >
          <Mail size={16} />
          Message
        </a>
        <button
          className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-outline-variant text-sm font-semibold hover:bg-surface-container-low"
          onClick={() => setModal("map")}
          type="button"
        >
          <Phone size={16} />
          Call
        </button>
      </div>

      {modal === "map" ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-background/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-outline-variant bg-surface p-6 ambient-shadow">
            <h2 className="font-heading text-xl font-semibold text-primary">{ownerName}</h2>
            <p className="mt-2 text-sm text-on-surface-variant">
              Owner contact details are managed in your CRM. Use the Owners section to view full contact info.
            </p>
            <div className="mt-4 flex gap-3">
              <button
                className="h-10 flex-1 rounded-lg border border-outline-variant text-sm font-semibold"
                onClick={() => setModal(null)}
                type="button"
              >
                Close
              </button>
              <Link
                className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-primary-container text-sm font-semibold text-on-primary"
                href="/owners"
                onClick={() => setModal(null)}
              >
                View Owners
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

/* ──── View Live Listing (opens Google Maps) ──── */
export function ViewListingButton({ address, name }: { address: string; name: string }) {
  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(`${name} ${address}`)}`;
  return (
    <a
      className="flex h-11 items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 text-sm font-semibold hover:bg-surface-container-low"
      href={mapsUrl}
      rel="noopener noreferrer"
      target="_blank"
    >
      <ExternalLink size={15} />
      View on Map
    </a>
  );
}

/* ──── Edit Profile CTA → opens edit dialog ──── */
export function EditPropertyButton({ id }: { id: string }) {
  return (
    <Link
      className="flex h-11 items-center rounded-lg bg-primary-container px-4 text-sm font-semibold text-on-primary hover:bg-primary"
      href={`/properties/${id}?tab=overview`}
    >
      Edit Profile
    </Link>
  );
}
