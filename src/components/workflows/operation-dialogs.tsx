"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, HousePlus, Pencil, Trash2, X } from "lucide-react";
import { createBooking, createProperty, deleteBooking, deleteProperty, updateBooking, updateProperty } from "@/app/actions";
import { ConfirmDialog } from "@/components/app/confirm-dialog";
import type { Booking, Property } from "@/lib/types";

type DialogState = {
  open: boolean;
  message: string;
};

function useDialogAction() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<DialogState>({ open: false, message: "" });

  return {
    isPending,
    state,
    setState,
    run(action: () => Promise<{ ok: boolean; message: string }>, onSuccess?: () => void) {
      startTransition(async () => {
        const result = await action();
        setState((current) => ({ ...current, message: result.message }));
        if (result.ok) {
          onSuccess?.();
          router.refresh();
        }
      });
    },
  };
}

/* ───────── Create Property ───────── */
export function PropertyCreateDialog() {
  const formRef = useRef<HTMLFormElement>(null);
  const { isPending, state, setState, run } = useDialogAction();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <button
        className="flex h-11 items-center gap-2 rounded-lg bg-primary-container px-4 text-sm font-semibold text-on-primary disabled:cursor-not-allowed disabled:opacity-60"
        disabled={!mounted}
        onClick={() => setState({ open: true, message: "" })}
      >
        <HousePlus size={17} />
        Add Property
      </button>
      {state.open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-background/40 p-4 backdrop-blur-sm">
          <form
            className="w-full max-w-lg rounded-xl border border-outline-variant bg-surface p-6 ambient-shadow"
            onSubmit={(event) => {
              event.preventDefault();
              const form = formRef.current;
              if (!form) return;
              run(() => createProperty(new FormData(form)), () => {
                form.reset();
              });
            }}
            ref={formRef}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="font-heading text-2xl font-semibold text-primary">Add Property</h2>
                <p className="text-sm text-on-surface-variant">Create a new property and start setup workflows.</p>
              </div>
              <button className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container" onClick={() => setState({ open: false, message: "" })} type="button">
                <X size={20} />
              </button>
            </div>
            <div className="grid gap-4">
              <input className="h-11 rounded-lg border border-outline-variant px-4 text-sm" name="name" placeholder="Property name" required />
              <input className="h-11 rounded-lg border border-outline-variant px-4 text-sm" name="address" placeholder="Address" />
              <input className="h-11 rounded-lg border border-outline-variant px-4 text-sm" name="owner" placeholder="Owner name" />
              <div className="grid gap-3 sm:grid-cols-2">
                <select className="h-11 rounded-lg border border-outline-variant px-3 text-sm" defaultValue="mixed" name="rentalModel">
                  <option value="mixed">Mixed rental</option>
                  <option value="short_term">Short-term</option>
                  <option value="long_term">Long-term</option>
                </select>
                <select className="h-11 rounded-lg border border-outline-variant px-3 text-sm" defaultValue="Vacant" name="status">
                  <option value="Vacant">Vacant</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
            </div>
            {state.message ? (
              <p className="mt-4 rounded-lg bg-secondary-container px-3 py-2 text-sm font-semibold text-on-secondary-container">{state.message}</p>
            ) : null}
            <button className="mt-6 h-11 w-full rounded-lg bg-primary-container text-sm font-semibold text-on-primary disabled:opacity-60" disabled={isPending}>
              {isPending ? "Saving..." : "Create Property"}
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}

/* ───────── Edit Property ───────── */
export function PropertyEditDialog({ property }: { property: Property }) {
  const formRef = useRef<HTMLFormElement>(null);
  const { isPending, state, setState, run } = useDialogAction();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <button
        aria-label="Edit property"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-60"
        disabled={!mounted}
        onClick={() => setState({ open: true, message: "" })}
        title="Edit property"
      >
        <Pencil size={15} />
      </button>

      {state.open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-background/40 p-4 backdrop-blur-sm">
          <form
            className="w-full max-w-lg rounded-xl border border-outline-variant bg-surface p-6 ambient-shadow"
            onSubmit={(event) => {
              event.preventDefault();
              const form = formRef.current;
              if (!form) return;
              run(() => updateProperty(new FormData(form)), () => setState({ open: false, message: "" }));
            }}
            ref={formRef}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="font-heading text-2xl font-semibold text-primary">Edit Property</h2>
                <p className="text-sm text-on-surface-variant">Update property details.</p>
              </div>
              <button className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container" onClick={() => setState({ open: false, message: "" })} type="button">
                <X size={20} />
              </button>
            </div>
            <input type="hidden" name="id" value={property.id} />
            <div className="grid gap-4">
              <input className="h-11 rounded-lg border border-outline-variant px-4 text-sm" defaultValue={property.name} name="name" placeholder="Property name" required />
              <input className="h-11 rounded-lg border border-outline-variant px-4 text-sm" defaultValue={property.address} name="address" placeholder="Address" />
              <input className="h-11 rounded-lg border border-outline-variant px-4 text-sm" defaultValue={property.owner} name="owner" placeholder="Owner name" />
              <div className="grid gap-3 sm:grid-cols-2">
                <select className="h-11 rounded-lg border border-outline-variant px-3 text-sm" defaultValue={property.model} name="rentalModel">
                  <option value="mixed">Mixed rental</option>
                  <option value="short_term">Short-term</option>
                  <option value="long_term">Long-term</option>
                </select>
                <select className="h-11 rounded-lg border border-outline-variant px-3 text-sm" defaultValue={property.status} name="status">
                  <option value="Vacant">Vacant</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
            </div>
            {state.message ? (
              <p className="mt-4 rounded-lg bg-secondary-container px-3 py-2 text-sm font-semibold text-on-secondary-container">{state.message}</p>
            ) : null}
            <div className="mt-6 flex gap-3">
              <button
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-error/30 text-error hover:bg-error-container/20"
                onClick={() => setConfirmDelete(true)}
                title="Delete property"
                type="button"
              >
                <Trash2 size={17} />
              </button>
              <button className="h-11 flex-1 rounded-lg border border-outline-variant text-sm font-semibold" onClick={() => setState({ open: false, message: "" })} type="button">
                Cancel
              </button>
              <button className="h-11 flex-1 rounded-lg bg-primary-container text-sm font-semibold text-on-primary disabled:opacity-60" disabled={isPending}>
                {isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <ConfirmDialog
        confirmLabel="Delete Property"
        description={`"${property.name}" will be permanently removed. This cannot be undone.`}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={async () => {
          const fd = new FormData();
          fd.set("id", property.id);
          await deleteProperty(fd);
          setConfirmDelete(false);
          setState({ open: false, message: "" });
          router.refresh();
        }}
        open={confirmDelete}
        title="Delete Property?"
      />
    </>
  );
}

/* ───────── Create Booking ───────── */
export function BookingCreateDialog({ properties }: { properties: Property[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const { isPending, state, setState, run } = useDialogAction();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <button
        className="flex h-11 items-center gap-2 rounded-lg bg-primary-container px-4 text-sm font-semibold text-on-primary disabled:cursor-not-allowed disabled:opacity-60"
        disabled={!mounted}
        onClick={() => setState({ open: true, message: "" })}
      >
        <CalendarPlus size={17} />
        New Booking
      </button>
      {state.open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-background/40 p-4 backdrop-blur-sm">
          <form
            className="w-full max-w-lg rounded-xl border border-outline-variant bg-surface p-6 ambient-shadow"
            onSubmit={(event) => {
              event.preventDefault();
              const form = formRef.current;
              if (!form) return;
              run(() => createBooking(new FormData(form)), () => {
                form.reset();
              });
            }}
            ref={formRef}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="font-heading text-2xl font-semibold text-primary">New Booking</h2>
                <p className="text-sm text-on-surface-variant">Add a reservation and generate downstream ops.</p>
              </div>
              <button className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container" onClick={() => setState({ open: false, message: "" })} type="button">
                <X size={20} />
              </button>
            </div>
            <div className="grid gap-4">
              <input className="h-11 rounded-lg border border-outline-variant px-4 text-sm" name="guestName" placeholder="Guest or tenant name" required />
              <input className="h-11 rounded-lg border border-outline-variant px-4 text-sm" name="email" placeholder="Email" type="email" />
              <select className="h-11 rounded-lg border border-outline-variant px-3 text-sm" name="property">
                {properties.map((p) => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
              <div className="grid gap-3 sm:grid-cols-2">
                <select className="h-11 rounded-lg border border-outline-variant px-3 text-sm" defaultValue="Direct" name="platform">
                  {(["Direct", "Airbnb", "VRBO", "Lease"] satisfies Booking["platform"][]).map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <input className="h-11 rounded-lg border border-outline-variant px-4 text-sm" min="0" name="amount" placeholder="Amount ($)" type="number" />
              </div>
            </div>
            {state.message ? (
              <p className="mt-4 rounded-lg bg-secondary-container px-3 py-2 text-sm font-semibold text-on-secondary-container">{state.message}</p>
            ) : null}
            <button className="mt-6 h-11 w-full rounded-lg bg-primary-container text-sm font-semibold text-on-primary disabled:opacity-60" disabled={isPending}>
              {isPending ? "Saving..." : "Create Booking"}
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}

/* ───────── Edit / Delete Booking (inline row actions) ───────── */
export function BookingRowActions({ booking, properties }: { booking: Booking; properties: Property[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const { isPending, state, setState, run } = useDialogAction();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const router = useRouter();

  const nextStatus: Record<Booking["status"], { label: string; next: Booking["status"] } | null> = {
    Pending: { label: "Confirm", next: "Confirmed" },
    Confirmed: { label: "Check In", next: "Checked-in" },
    "Checked-in": { label: "Check Out", next: "Checked-out" },
    "Checked-out": null,
    Cancelled: null,
  };

  const transition = nextStatus[booking.status];

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        {transition ? (
          <button
            className="h-8 rounded-lg bg-secondary px-3 text-xs font-semibold text-on-secondary hover:bg-secondary-fixed"
            onClick={() => {
              const fd = new FormData();
              fd.set("id", booking.id);
              fd.set("guestName", booking.guest);
              fd.set("email", booking.email);
              fd.set("platform", booking.platform);
              fd.set("amount", String(booking.amount));
              fd.set("status", transition.next);
              fd.set("payment", booking.payment);
              run(() => updateBooking(fd));
            }}
            title={`${transition.label} this booking`}
          >
            {isPending ? "..." : transition.label}
          </button>
        ) : null}
        {booking.status !== "Cancelled" && booking.status !== "Checked-out" ? (
          <button
            className="h-8 rounded-lg border border-outline-variant px-3 text-xs font-semibold hover:bg-surface-container-low"
            onClick={() => {
              const fd = new FormData();
              fd.set("id", booking.id);
              fd.set("guestName", booking.guest);
              fd.set("email", booking.email);
              fd.set("platform", booking.platform);
              fd.set("amount", String(booking.amount));
              fd.set("status", "Cancelled");
              fd.set("payment", booking.payment);
              run(() => updateBooking(fd));
            }}
            title="Cancel booking"
          >
            Cancel
          </button>
        ) : null}
        {booking.payment !== "Paid" ? (
          <button
            className="h-8 rounded-lg border border-secondary/40 px-3 text-xs font-semibold text-secondary hover:bg-secondary/10"
            onClick={() => {
              const fd = new FormData();
              fd.set("id", booking.id);
              fd.set("guestName", booking.guest);
              fd.set("email", booking.email);
              fd.set("platform", booking.platform);
              fd.set("amount", String(booking.amount));
              fd.set("status", booking.status);
              fd.set("payment", "Paid");
              run(() => updateBooking(fd));
            }}
            title="Mark booking paid"
          >
            Paid
          </button>
        ) : null}
        <button
          aria-label="Edit booking"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
          onClick={() => setState({ open: true, message: "" })}
          title="Edit booking"
        >
          <Pencil size={13} />
        </button>
        <button
          aria-label="Delete booking"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-error/30 text-error hover:bg-error-container/20"
          onClick={() => setConfirmDelete(true)}
          title="Delete booking"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {state.open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-background/40 p-4 backdrop-blur-sm">
          <form
            className="w-full max-w-lg rounded-xl border border-outline-variant bg-surface p-6 ambient-shadow"
            onSubmit={(event) => {
              event.preventDefault();
              const form = formRef.current;
              if (!form) return;
              run(() => updateBooking(new FormData(form)), () => setState({ open: false, message: "" }));
            }}
            ref={formRef}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="font-heading text-2xl font-semibold text-primary">Edit Booking</h2>
                <p className="text-sm text-on-surface-variant">Update reservation details.</p>
              </div>
              <button className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container" onClick={() => setState({ open: false, message: "" })} type="button">
                <X size={20} />
              </button>
            </div>
            <input type="hidden" name="id" value={booking.id} />
            <div className="grid gap-4">
              <input className="h-11 rounded-lg border border-outline-variant px-4 text-sm" defaultValue={booking.guest} name="guestName" placeholder="Guest name" required />
              <input className="h-11 rounded-lg border border-outline-variant px-4 text-sm" defaultValue={booking.email} name="email" placeholder="Email" type="email" />
              <select className="h-11 rounded-lg border border-outline-variant px-3 text-sm" defaultValue={booking.property} name="property">
                {properties.map((p) => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
              <div className="grid gap-3 sm:grid-cols-2">
                <select className="h-11 rounded-lg border border-outline-variant px-3 text-sm" defaultValue={booking.platform} name="platform">
                  {(["Direct", "Airbnb", "VRBO", "Lease"] satisfies Booking["platform"][]).map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <input className="h-11 rounded-lg border border-outline-variant px-4 text-sm" defaultValue={booking.amount} min="0" name="amount" type="number" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <select className="h-11 rounded-lg border border-outline-variant px-3 text-sm" defaultValue={booking.status} name="status">
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Checked-in">Checked-in</option>
                  <option value="Checked-out">Checked-out</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <select className="h-11 rounded-lg border border-outline-variant px-3 text-sm" defaultValue={booking.payment} name="payment">
                  <option value="Unpaid">Unpaid</option>
                  <option value="Partial">Deposit paid</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
            </div>
            {state.message ? (
              <p className="mt-4 rounded-lg bg-secondary-container px-3 py-2 text-sm font-semibold text-on-secondary-container">{state.message}</p>
            ) : null}
            <div className="mt-6 flex gap-3">
              <button className="h-11 flex-1 rounded-lg border border-outline-variant text-sm font-semibold" onClick={() => setState({ open: false, message: "" })} type="button">Cancel</button>
              <button className="h-11 flex-1 rounded-lg bg-primary-container text-sm font-semibold text-on-primary disabled:opacity-60" disabled={isPending}>
                {isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <ConfirmDialog
        confirmLabel="Delete Booking"
        description={`Booking for "${booking.guest}" will be permanently removed.`}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={async () => {
          const fd = new FormData();
          fd.set("id", booking.id);
          await deleteBooking(fd);
          setConfirmDelete(false);
          router.refresh();
        }}
        open={confirmDelete}
        title="Delete Booking?"
      />
    </>
  );
}
