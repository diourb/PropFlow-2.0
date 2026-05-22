"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Download, FileText, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { createOwner, deleteOwner, updateOwner } from "@/app/actions";
import { ConfirmDialog } from "@/components/app/confirm-dialog";
import { StatusPill } from "@/components/app/status-pill";
import type { OwnerProfile, OwnerStatement, Property } from "@/lib/types";

function OwnerForm({
  owner,
  onClose,
  onSaved,
  properties,
}: {
  owner?: OwnerProfile;
  onClose: () => void;
  onSaved: () => void;
  properties: Property[];
}) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const isEdit = Boolean(owner);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-on-background/40 p-4 backdrop-blur-sm">
      <form
        className="w-full max-w-lg rounded-xl border border-outline-variant bg-surface p-6 ambient-shadow"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          startTransition(async () => {
            const result = isEdit ? await updateOwner(formData) : await createOwner(formData);
            setMessage(result.message);
            if (result.ok) onSaved();
          });
        }}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-semibold text-primary">
              {isEdit ? "Edit Owner" : "Add Owner"}
            </h2>
            <p className="text-sm text-on-surface-variant">
              Assign properties and maintain owner contact details.
            </p>
          </div>
          <button className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>
        {owner ? <input name="id" type="hidden" value={owner.id} /> : null}
        <div className="grid gap-4">
          <input className="h-11 rounded-lg border border-outline-variant px-4 text-sm" defaultValue={owner?.name} name="name" placeholder="Owner name" required />
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="h-11 rounded-lg border border-outline-variant px-4 text-sm" defaultValue={owner?.email} name="email" placeholder="owner@example.com" type="email" />
            <input className="h-11 rounded-lg border border-outline-variant px-4 text-sm" defaultValue={owner?.phone} name="phone" placeholder="+1 (555) 000-0000" />
          </div>
          <select className="h-11 rounded-lg border border-outline-variant px-3 text-sm" defaultValue={owner?.status ?? "active"} name="status">
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
          <div className="rounded-lg border border-outline-variant p-3">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-on-surface-variant">
              Assigned properties
            </p>
            <div className="grid max-h-44 gap-2 overflow-y-auto pr-1">
              {properties.map((property) => (
                <label className="flex items-center gap-2 text-sm" key={property.id}>
                  <input
                    defaultChecked={owner?.properties.includes(property.id)}
                    name="propertyIds"
                    type="checkbox"
                    value={property.id}
                  />
                  <span>{property.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        {message ? <p className="mt-4 rounded-lg bg-secondary-container px-3 py-2 text-sm font-semibold text-on-secondary-container">{message}</p> : null}
        <div className="mt-6 flex gap-3">
          <button className="h-11 flex-1 rounded-lg border border-outline-variant text-sm font-semibold" onClick={onClose} type="button">Cancel</button>
          <button className="h-11 flex-1 rounded-lg bg-primary-container text-sm font-semibold text-on-primary disabled:opacity-60" disabled={isPending}>
            {isPending ? "Saving..." : isEdit ? "Save Owner" : "Add Owner"}
          </button>
        </div>
      </form>
    </div>
  );
}

export function OwnersManager({
  initialOwners,
  ownerStatements,
  properties,
}: {
  initialOwners: OwnerProfile[];
  ownerStatements: OwnerStatement[];
  properties: Property[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOwner, setEditOwner] = useState<OwnerProfile | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OwnerProfile | null>(null);

  const owners = useMemo(
    () =>
      initialOwners.filter((owner) => {
        const q = query.toLowerCase();
        if (q && !owner.name.toLowerCase().includes(q) && !owner.email.toLowerCase().includes(q)) return false;
        if (status && owner.status !== status) return false;
        return true;
      }),
    [initialOwners, query, status],
  );

  return (
    <>
      <div className="mb-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 ambient-shadow">
        <div className="flex flex-col justify-between gap-3 sm:flex-row">
          <div className="flex flex-wrap gap-3">
            <label className="flex h-10 w-full items-center gap-2 rounded-lg border border-outline-variant bg-surface px-3 sm:w-72">
              <Search size={16} className="text-outline" />
              <input className="w-full bg-transparent text-sm outline-none" onChange={(event) => setQuery(event.target.value)} placeholder="Search owners" value={query} />
            </label>
            <select className="h-10 rounded-lg border border-outline-variant bg-surface px-3 text-sm" onChange={(event) => setStatus(event.target.value)} value={status}>
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <button className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary-container px-4 text-sm font-semibold text-on-primary" onClick={() => setCreateOpen(true)} type="button">
            <Plus size={16} />
            Add Owner
          </button>
        </div>
      </div>

      {owners.length === 0 ? (
        <div className="rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest p-10 text-center ambient-shadow">
          <h2 className="font-heading text-2xl font-semibold text-primary">No owners found</h2>
          <p className="mt-2 text-sm text-on-surface-variant">Add an owner or clear filters to see the portfolio.</p>
          <button className="mt-6 h-11 rounded-lg bg-primary-container px-5 text-sm font-semibold text-on-primary" onClick={() => setCreateOpen(true)} type="button">
            Add first owner
          </button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {owners.map((owner) => {
            const assigned = properties.filter((property) => owner.properties.includes(property.id));
            const statement = ownerStatements.find((item) => item.owner === owner.name);
            return (
              <article className="rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-6 ambient-shadow" key={owner.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-heading text-xl font-semibold text-primary">{owner.name}</h2>
                    <p className="mt-1 text-sm text-on-surface-variant">{owner.email || "No email"}</p>
                  </div>
                  <StatusPill tone={owner.status === "active" ? "success" : owner.status === "inactive" ? "danger" : "neutral"}>
                    {owner.status}
                  </StatusPill>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-surface-container-low p-3">
                    <p className="text-xs font-semibold text-on-surface-variant">Properties</p>
                    <p className="mt-1 font-heading text-xl font-semibold text-primary">{assigned.length}</p>
                  </div>
                  <div className="rounded-lg bg-surface-container-low p-3">
                    <p className="text-xs font-semibold text-on-surface-variant">Payout</p>
                    <p className="mt-1 font-heading text-xl font-semibold text-secondary">${(statement?.payout ?? 0).toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-outline-variant text-sm font-semibold hover:bg-surface-container-low" href="/reports">
                    <FileText size={15} />
                    Report
                  </Link>
                  <a className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-outline-variant text-sm font-semibold hover:bg-surface-container-low" href="/api/exports/csv">
                    <Download size={15} />
                    Export
                  </a>
                  <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-low" onClick={() => setEditOwner(owner)} type="button">
                    <Pencil size={15} />
                  </button>
                  <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-error/30 text-error hover:bg-error-container/20" onClick={() => setDeleteTarget(owner)} type="button">
                    <Trash2 size={15} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {createOpen ? <OwnerForm onClose={() => setCreateOpen(false)} onSaved={() => { setCreateOpen(false); router.refresh(); }} properties={properties} /> : null}
      {editOwner ? <OwnerForm owner={editOwner} onClose={() => setEditOwner(null)} onSaved={() => { setEditOwner(null); router.refresh(); }} properties={properties} /> : null}
      <ConfirmDialog
        confirmLabel="Remove Owner"
        description={`"${deleteTarget?.name}" will be removed and assigned properties will become unassigned.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          const formData = new FormData();
          formData.set("id", deleteTarget.id);
          await deleteOwner(formData);
          setDeleteTarget(null);
          router.refresh();
        }}
        open={Boolean(deleteTarget)}
        title="Remove Owner?"
      />
    </>
  );
}
