"use client";

import { useState } from "react";
import { Book, CalendarPlus, MessageCircle, X } from "lucide-react";
import { GuestRequestForm } from "@/components/workflows/guest-request-form";
import type { Booking } from "@/lib/types";

function ArrivalGuideModal({
  booking,
  onClose,
}: {
  booking: Booking;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-background/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-surface ambient-shadow">
        <div className="flex items-center justify-between border-b border-outline-variant p-4">
          <h2 className="font-heading text-xl font-semibold text-primary">Arrival Guide</h2>
          <button className="rounded-full p-2 hover:bg-surface-container-high" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4 p-6">
          <div className="rounded-lg bg-surface-container-low p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-secondary">Property</p>
            <p className="mt-1 font-semibold text-primary">{booking.property}</p>
          </div>
          <div className="rounded-lg bg-surface-container-low p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-secondary">Stay Dates</p>
            <p className="mt-1 font-semibold text-primary">{booking.stayDates}</p>
          </div>
          <div className="space-y-3 rounded-lg border border-outline-variant/30 p-4 text-sm text-on-surface-variant">
            <p className="font-semibold text-on-surface">Check-in Instructions</p>
            <p>1. Use the keypad code <strong className="text-primary">#4821</strong> at the front entrance.</p>
            <p>2. Your unit key is in the lockbox on the right side of the door.</p>
            <p>3. Parking is available in spots 12–14 in the rear garage.</p>
            <p>4. WiFi network: <strong className="text-primary">PropFlow-Guest</strong> · Password: <strong className="text-primary">welcome2024</strong></p>
          </div>
          <button
            className="h-11 w-full rounded-lg bg-primary-container text-sm font-semibold text-on-primary"
            onClick={onClose}
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
}

export function GuestStayActions({ booking }: { booking: Booking }) {
  const [modal, setModal] = useState<"guide" | "extend" | "message" | null>(null);

  return (
    <>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <button
          className="flex h-11 items-center justify-center gap-2 rounded-lg bg-primary-container text-sm font-semibold text-on-primary hover:bg-primary"
          onClick={() => setModal("guide")}
          type="button"
        >
          <Book size={16} />
          Arrival Guide
        </button>
        <button
          className="flex h-11 items-center justify-center gap-2 rounded-lg border border-outline-variant text-sm font-semibold hover:bg-surface-container-low"
          onClick={() => setModal("extend")}
          type="button"
        >
          <CalendarPlus size={16} />
          Extend Stay
        </button>
        <button
          className="flex h-11 items-center justify-center gap-2 rounded-lg border border-outline-variant text-sm font-semibold hover:bg-surface-container-low"
          onClick={() => setModal("message")}
          type="button"
        >
          <MessageCircle size={16} />
          Message Host
        </button>
      </div>

      {modal === "guide" ? (
        <ArrivalGuideModal booking={booking} onClose={() => setModal(null)} />
      ) : null}

      {(modal === "extend" || modal === "message") ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-background/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-surface ambient-shadow">
            <div className="flex items-center justify-between border-b border-outline-variant p-4">
              <h2 className="font-heading text-xl font-semibold text-primary">
                {modal === "extend" ? "Request Stay Extension" : "Message Host"}
              </h2>
              <button className="rounded-full p-2 hover:bg-surface-container-high" onClick={() => setModal(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              {modal === "extend" ? (
                <p className="mb-4 text-sm text-on-surface-variant">
                  Submit a request to extend your stay. The host will review availability and confirm.
                </p>
              ) : null}
              <GuestRequestForm property={booking.property} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
