"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, MessageCircle, Pencil, Plus, Search, Trash2, UserPlus, X } from "lucide-react";
import { createGuest, deleteGuest, updateGuest } from "@/app/actions";
import { ConfirmDialog } from "@/components/app/confirm-dialog";
import { StatusPill } from "@/components/app/status-pill";
import { EmptyState } from "@/components/app/empty-state";
import type { Guest } from "@/lib/types";

function GuestForm({
  guest,
  onClose,
  onSaved,
}: {
  guest?: Guest;
  onClose: () => void;
  onSaved: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  const isEdit = Boolean(guest);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-background/40 p-4 backdrop-blur-sm">
      <form
        className="w-full max-w-md rounded-xl border border-outline-variant bg-surface p-6 ambient-shadow"
        onSubmit={(event) => {
          event.preventDefault();
          const form = formRef.current;
          if (!form) return;
          startTransition(async () => {
            const result = isEdit ? await updateGuest(new FormData(form)) : await createGuest(new FormData(form));
            setMessage(result.message);
            if (result.ok) onSaved();
          });
        }}
        ref={formRef}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-2xl font-semibold text-primary">
              {isEdit ? "Edit Guest" : "Add Guest"}
            </h2>
            <p className="text-sm text-on-surface-variant">
              {isEdit ? "Update guest contact information." : "Add a new guest to the CRM."}
            </p>
          </div>
          <button className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>
        {guest ? <input type="hidden" name="id" value={guest.id} /> : null}
        <div className="grid gap-4">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-on-surface-variant">Full Name *</span>
            <input
              className="h-11 w-full rounded-lg border border-outline-variant px-4 text-sm outline-none focus:border-secondary"
              defaultValue={guest?.name}
              name="name"
              placeholder="Jane Smith"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-on-surface-variant">Email Address *</span>
            <input
              className="h-11 w-full rounded-lg border border-outline-variant px-4 text-sm outline-none focus:border-secondary"
              defaultValue={guest?.email}
              name="email"
              placeholder="guest@example.com"
              required
              type="email"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-on-surface-variant">Phone</span>
            <input
              className="h-11 w-full rounded-lg border border-outline-variant px-4 text-sm outline-none focus:border-secondary"
              defaultValue={guest?.phone}
              name="phone"
              placeholder="+1 (555) 000-0000"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-on-surface-variant">Tag / Flag</span>
            <input
              className="h-11 w-full rounded-lg border border-outline-variant px-4 text-sm outline-none focus:border-secondary"
              defaultValue={guest?.flag}
              name="flag"
              placeholder="VIP, Corporate Client, etc."
            />
          </label>
        </div>
        {message ? (
          <p className="mt-4 rounded-lg bg-secondary-container px-3 py-2 text-sm font-semibold text-on-secondary-container">{message}</p>
        ) : null}
        <div className="mt-6 flex gap-3">
          <button className="h-11 flex-1 rounded-lg border border-outline-variant text-sm font-semibold" onClick={onClose} type="button">Cancel</button>
          <button className="h-11 flex-1 rounded-lg bg-primary-container text-sm font-semibold text-on-primary disabled:opacity-60" disabled={isPending}>
            {isPending ? "Saving..." : isEdit ? "Save Changes" : "Add Guest"}
          </button>
        </div>
      </form>
    </div>
  );
}

export function GuestsManager({ initialGuests }: { initialGuests: Guest[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState("recent");
  const [editGuest, setEditGuest] = useState<Guest | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Guest | null>(null);

  const filtered = initialGuests
    .filter((g) => {
      const q = query.toLowerCase();
      if (q && !g.name.toLowerCase().includes(q) && !g.email.toLowerCase().includes(q)) return false;
      if (statusFilter && g.status.toLowerCase().replace(/\s+/g, "_") !== statusFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === "ltv") return b.ltv - a.ltv;
      if (sort === "name") return a.name.localeCompare(b.name);
      return 0;
    });

  function onSaved() {
    setCreateOpen(false);
    setEditGuest(null);
    router.refresh();
  }

  return (
    <>
      {/* Toolbar */}
      <div className="rounded-t-xl border border-b-0 border-outline-variant bg-surface p-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row">
          <div className="flex flex-wrap gap-3">
            <label className="flex h-10 w-full items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-low px-3 sm:w-72">
              <Search size={17} className="shrink-0 text-outline" />
              <input
                className="w-full bg-transparent text-sm outline-none"
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or email"
                value={query}
              />
              {query ? (
                <button onClick={() => setQuery("")} type="button">
                  <X size={14} className="text-outline" />
                </button>
              ) : null}
            </label>
            <select
              className="h-10 rounded-lg border border-outline-variant bg-surface px-3 text-sm font-semibold text-on-surface-variant"
              onChange={(e) => setStatusFilter(e.target.value)}
              value={statusFilter}
            >
              <option value="">All Statuses</option>
              <option value="active_booking">Active Booking</option>
              <option value="upcoming">Upcoming</option>
              <option value="tenant">Tenant</option>
              <option value="past_guest">Past Guest</option>
            </select>
            {(query || statusFilter) ? (
              <button
                className="h-10 rounded-lg border border-outline-variant px-3 text-sm font-semibold"
                onClick={() => { setQuery(""); setStatusFilter(""); }}
              >
                Clear
              </button>
            ) : null}
          </div>
          <select
            className="h-10 rounded-lg border border-outline-variant bg-surface px-3 text-sm"
            onChange={(e) => setSort(e.target.value)}
            value={sort}
          >
            <option value="recent">Recent Activity</option>
            <option value="ltv">Lifetime Value</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-b-xl border border-outline-variant bg-surface ambient-shadow">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-surface-container-low text-xs uppercase tracking-wide text-on-surface-variant">
              <tr>
                {["Guest", "Contact", "Status", "Stays", "LTV", "Last Stay", "Actions"].map((h) => (
                  <th className="px-4 py-3 font-semibold" key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filtered.length === 0 ? (
                <tr>
                  <td className="px-4 py-8" colSpan={7}>
                    <EmptyState
                      title={query || statusFilter ? "No guests match" : "No guests yet"}
                      description={query || statusFilter ? "Try adjusting your filters or search terms." : "Add your first guest to start building your property CRM."}
                      icon={query || statusFilter ? Search : UserPlus}
                      action={
                        query || statusFilter ? (
                          <button
                            className="h-11 rounded-lg border border-outline-variant px-6 text-sm font-semibold"
                            onClick={() => { setQuery(""); setStatusFilter(""); }}
                          >
                            Clear Filters
                          </button>
                        ) : (
                          <button
                            className="h-11 rounded-lg bg-primary-container px-6 text-sm font-semibold text-on-primary"
                            onClick={() => setCreateOpen(true)}
                          >
                            Add First Guest
                          </button>
                        )
                      }
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((guest) => (
                  <tr className="hover:bg-surface-container-lowest" key={guest.id}>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container-high font-semibold text-primary">
                          {guest.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                        </span>
                        <span>
                          <span className="block font-semibold">{guest.name}</span>
                          {guest.flag ? <span className="inline-block rounded bg-secondary-container/50 px-1.5 py-0.5 text-xs font-semibold text-on-secondary-container">{guest.flag}</span> : null}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="block">{guest.email}</span>
                      <span className="text-xs text-on-surface-variant">{guest.phone}</span>
                    </td>
                    <td className="px-4 py-4">
                      <StatusPill tone={guest.status === "Active Booking" ? "success" : guest.status === "Tenant" ? "info" : guest.status === "Upcoming" ? "neutral" : "neutral"}>
                        {guest.status}
                      </StatusPill>
                    </td>
                    <td className="px-4 py-4">{guest.stays}</td>
                    <td className="px-4 py-4 font-semibold">${guest.ltv.toLocaleString()}</td>
                    <td className="px-4 py-4 max-w-[180px] truncate text-on-surface-variant">{guest.lastStay}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <a
                          className="flex h-8 items-center gap-1.5 rounded border border-outline-variant px-2 text-xs font-semibold hover:bg-surface-container-low"
                          href={`mailto:${guest.email}`}
                          title="Send email"
                        >
                          <MessageCircle size={13} />
                          Message
                        </a>
                        <button
                          aria-label="Edit guest"
                          className="flex h-8 w-8 items-center justify-center rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
                          onClick={() => setEditGuest(guest)}
                          title="Edit guest"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          aria-label="Delete guest"
                          className="flex h-8 w-8 items-center justify-center rounded border border-error/30 text-error hover:bg-error-container/20"
                          onClick={() => setDeleteTarget(guest)}
                          title="Delete guest"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="border-t border-outline-variant/30 px-4 py-3 text-xs text-on-surface-variant">
            Showing {filtered.length} of {initialGuests.length} guests
          </div>
        )}
      </div>

      {/* Header actions — Export + Add Guest (outside table for layout) */}
      <div className="mt-4 flex justify-end gap-3">
        <a
          className="flex h-9 items-center gap-2 rounded-lg border border-outline-variant bg-surface px-4 text-sm font-semibold"
          href="/api/exports/csv"
        >
          <Download size={15} />
          Export CSV
        </a>
        <button
          className="flex h-9 items-center gap-2 rounded-lg bg-primary-container px-4 text-sm font-semibold text-on-primary"
          onClick={() => setCreateOpen(true)}
        >
          <UserPlus size={15} />
          Add Guest
        </button>
      </div>

      {/* Modals */}
      {createOpen ? (
        <GuestForm onClose={() => setCreateOpen(false)} onSaved={onSaved} />
      ) : null}
      {editGuest ? (
        <GuestForm guest={editGuest} onClose={() => setEditGuest(null)} onSaved={onSaved} />
      ) : null}

      <ConfirmDialog
        confirmLabel="Remove Guest"
        description={`"${deleteTarget?.name}" will be permanently removed from the CRM.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          const fd = new FormData();
          fd.set("id", deleteTarget.id);
          await deleteGuest(fd);
          setDeleteTarget(null);
          router.refresh();
        }}
        open={Boolean(deleteTarget)}
        title="Remove Guest?"
      />
    </>
  );
}

/* Standalone header action buttons rendered by the server page */
export function GuestPageHeader({ onAdd }: { onAdd?: () => void }) {
  return (
    <div className="flex gap-3">
      <a
        className="flex h-11 items-center gap-2 rounded-lg border border-outline-variant bg-surface px-4 text-sm font-semibold"
        href="/api/exports/csv"
      >
        <Download size={17} />
        Export
      </a>
      <button
        className="flex h-11 items-center gap-2 rounded-lg bg-primary-container px-4 text-sm font-semibold text-on-primary"
        onClick={onAdd}
      >
        <Plus size={17} />
        New Guest
      </button>
    </div>
  );
}
