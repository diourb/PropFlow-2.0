"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { Camera, ChevronLeft, ChevronRight, ExternalLink, Mail, Phone } from "lucide-react";
import type { Booking, MaintenanceRequest, Property } from "@/lib/types";

/* ──── Property Hero with Photo Upload ──── */
export function PropertyHero({
  src,
  alt,
  propertyId,
  address,
  status,
}: {
  src: string;
  alt: string;
  propertyId: string;
  address: string;
  status: Property["status"];
}) {
  const [imgSrc, setImgSrc] = useState(src);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setUploadMsg("");
    const fd = new FormData();
    fd.set("file", file);
    fd.set("propertyId", propertyId);
    try {
      const res = await fetch("/api/storage/property", { method: "POST", body: fd });
      const data = (await res.json()) as { signedUrl?: string; error?: string };
      if (data.signedUrl) {
        setImgSrc(data.signedUrl);
        setUploadMsg("Cover photo updated.");
      } else {
        setUploadMsg(data.error ?? "Upload failed.");
      }
    } catch {
      setUploadMsg("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mb-8 overflow-hidden rounded-xl ambient-shadow">
      <div className="relative h-72 md:h-[340px]">
        <Image
          alt={alt}
          className="object-cover"
          fill
          loading="eager"
          sizes="(min-width: 768px) calc(100vw - 280px), 100vw"
          src={imgSrc}
          unoptimized={imgSrc.startsWith("blob:") || imgSrc.includes("supabase")}
        />
        <div className="absolute bottom-4 left-4 rounded-lg border border-white/30 bg-surface-container-lowest/90 px-4 py-2 backdrop-blur">
          <span className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Camera size={17} />
            {address}
          </span>
        </div>
        <button
          aria-label="Upload cover photo"
          className="absolute bottom-4 right-16 flex items-center gap-1.5 rounded-lg border border-white/30 bg-surface-container-lowest/90 px-3 py-2 text-xs font-semibold text-on-surface backdrop-blur transition hover:bg-surface-container-lowest disabled:opacity-60"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          <Camera size={14} />
          {uploading ? "Uploading…" : "Update Photo"}
        </button>
        <input
          accept="image/*"
          className="sr-only"
          ref={inputRef}
          type="file"
          onChange={async (e) => {
            const file = e.currentTarget.files?.[0];
            if (file) await handleFile(file);
            e.currentTarget.value = "";
          }}
        />
        <div className="absolute right-4 top-4">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
              status === "Maintenance"
                ? "bg-error-container text-error"
                : status === "Vacant"
                ? "bg-secondary-container text-on-secondary-container"
                : "bg-primary-container text-on-primary"
            }`}
          >
            {status}
          </span>
        </div>
      </div>
      {uploadMsg ? (
        <div className="border-t border-outline-variant/30 bg-surface-container-lowest px-4 py-2 text-xs font-semibold text-on-surface-variant">
          {uploadMsg}
        </div>
      ) : null}
    </div>
  );
}

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
  const firstBookingDate = getBookingStartDate(bookings[0]?.stayDates, today.getFullYear());
  const initialDate = firstBookingDate ?? today;
  const [year, setYear] = useState(initialDate.getFullYear());
  const [month, setMonth] = useState(initialDate.getMonth());

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
            aria-label="Previous month"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-low"
            onClick={prevMonth}
            type="button"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            aria-label="Next month"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-low"
            onClick={nextMonth}
            type="button"
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

function getBookingStartDate(stayDates: string | undefined, fallbackYear: number) {
  if (!stayDates) return null;
  const [start] = stayDates.split(" - ");
  if (!start) return null;
  const parsed = new Date(/\d{4}/.test(start) ? start : `${start}, ${fallbackYear}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/* ──── Ownership Actions (Message / Call) ──── */
export function OwnershipActions({
  ownerName,
  email,
  phone,
}: {
  ownerName: string;
  email?: string;
  phone?: string;
}) {
  const [modal, setModal] = useState(false);
  const cleanPhone = phone?.replace(/[^\d+]/g, "");

  return (
    <>
      <div className="flex gap-2">
        {email ? (
          <a
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-outline-variant text-sm font-semibold hover:bg-surface-container-low"
            href={`mailto:${email}`}
            title={`Email ${ownerName}`}
          >
            <Mail size={16} />
            Message
          </a>
        ) : (
          <button
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-outline-variant text-sm font-semibold hover:bg-surface-container-low"
            onClick={() => setModal(true)}
            type="button"
          >
            <Mail size={16} />
            Message
          </button>
        )}
        {cleanPhone ? (
          <a
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-outline-variant text-sm font-semibold hover:bg-surface-container-low"
            href={`tel:${cleanPhone}`}
            title={`Call ${ownerName}`}
          >
            <Phone size={16} />
            Call
          </a>
        ) : (
          <button
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-outline-variant text-sm font-semibold hover:bg-surface-container-low"
            onClick={() => setModal(true)}
            type="button"
          >
            <Phone size={16} />
            Call
          </button>
        )}
      </div>

      {modal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-background/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-outline-variant bg-surface p-6 ambient-shadow">
            <h2 className="font-heading text-xl font-semibold text-primary">{ownerName}</h2>
            <p className="mt-2 text-sm text-on-surface-variant">
              Add owner email and phone details in the Owners section to enable direct contact actions.
            </p>
            <div className="mt-4 flex gap-3">
              <button
                className="h-10 flex-1 rounded-lg border border-outline-variant text-sm font-semibold"
                onClick={() => setModal(false)}
                type="button"
              >
                Close
              </button>
              <Link
                className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-primary-container text-sm font-semibold text-on-primary"
                href="/owners"
                onClick={() => setModal(false)}
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
