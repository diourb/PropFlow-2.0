"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ChevronDown, ChevronUp, Filter, MapPin, Paperclip, Pencil, Plus, Trash2, X } from "lucide-react";
import { createMaintenanceRequest, deleteMaintenanceRequest, updateMaintenanceRequest, updateWorkOrderStatus } from "@/app/actions";
import { ConfirmDialog } from "@/components/app/confirm-dialog";
import { StatusPill } from "@/components/app/status-pill";
import { EmptyState } from "@/components/app/empty-state";
import type { IssueReport, MaintenanceRequest, Property } from "@/lib/types";

type FilterState = "all" | MaintenanceRequest["status"];
const filterCycle: FilterState[] = ["all", "urgent", "in_progress", "awaiting_parts", "completed", "cancelled"];
const statusLabels: Record<MaintenanceRequest["status"], string> = {
  urgent: "Open / Urgent",
  in_progress: "In Progress",
  awaiting_parts: "Awaiting Parts",
  completed: "Completed",
  cancelled: "Cancelled",
};

function EditWorkOrderModal({
  request,
  onClose,
  onSaved,
}: {
  request: MaintenanceRequest;
  onClose: () => void;
  onSaved: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const attachInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [attachFile, setAttachFile] = useState<File | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-background/40 p-4 backdrop-blur-sm">
      <form
        className="w-full max-w-lg rounded-xl border border-outline-variant bg-surface p-6 ambient-shadow"
        onSubmit={(event) => {
          event.preventDefault();
          const form = formRef.current;
          if (!form) return;
          startTransition(async () => {
            const result = await updateMaintenanceRequest(new FormData(form));
            if (result.ok && attachFile) {
              const fd = new FormData();
              fd.set("file", attachFile);
              fd.set("requestId", request.id);
              try {
                await fetch("/api/storage/maintenance", { method: "POST", body: fd });
              } catch {
                // attachment upload failure does not block the save
              }
            }
            setMessage(result.message);
            if (result.ok) onSaved();
          });
        }}
        ref={formRef}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-2xl font-semibold text-primary">Edit Work Order</h2>
            <p className="text-sm text-on-surface-variant">{request.property}</p>
          </div>
          <button className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>
        <input type="hidden" name="id" value={request.id} />
        <div className="grid gap-4">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-on-surface-variant">Title *</span>
            <input className="h-11 w-full rounded-lg border border-outline-variant px-4 text-sm outline-none focus:border-secondary" defaultValue={request.title} name="title" required />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-on-surface-variant">Description</span>
            <textarea className="min-h-20 w-full rounded-lg border border-outline-variant p-3 text-sm outline-none focus:border-secondary" defaultValue={request.description} name="description" />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-on-surface-variant">Priority</span>
              <select className="h-11 w-full rounded-lg border border-outline-variant px-3 text-sm" defaultValue={request.priority} name="priority">
                <option value="Critical">Critical</option>
                <option value="High Priority">High Priority</option>
                <option value="Routine">Routine</option>
                <option value="Low">Low</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-on-surface-variant">Assignee</span>
              <input className="h-11 w-full rounded-lg border border-outline-variant px-4 text-sm outline-none focus:border-secondary" defaultValue={request.assignee} name="assignee" placeholder="Unassigned" />
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-on-surface-variant">Estimate</span>
            <input className="h-11 w-full rounded-lg border border-outline-variant px-4 text-sm outline-none focus:border-secondary" defaultValue={request.estimate} name="estimate" placeholder="$0" />
          </label>
          <div>
            <span className="mb-1 block text-xs font-semibold text-on-surface-variant">
              Photo / Receipt <span className="font-normal text-on-surface-variant">(optional)</span>
            </span>
            <button
              className="flex h-10 items-center gap-2 rounded-lg border border-dashed border-outline-variant bg-surface-container-low px-4 text-xs font-semibold hover:bg-surface-container-high"
              onClick={() => attachInputRef.current?.click()}
              type="button"
            >
              <Paperclip size={14} />
              {attachFile ? attachFile.name : "Attach file"}
            </button>
            <input
              accept="image/*,application/pdf"
              className="sr-only"
              ref={attachInputRef}
              type="file"
              onChange={(e) => {
                setAttachFile(e.currentTarget.files?.[0] ?? null);
                e.currentTarget.value = "";
              }}
            />
          </div>
        </div>
        {message ? <p className="mt-4 rounded-lg bg-secondary-container px-3 py-2 text-sm font-semibold text-on-secondary-container">{message}</p> : null}
        <div className="mt-6 flex gap-3">
          <button className="h-11 flex-1 rounded-lg border border-outline-variant text-sm font-semibold" onClick={onClose} type="button">Cancel</button>
          <button className="h-11 flex-1 rounded-lg bg-primary-container text-sm font-semibold text-on-primary disabled:opacity-60" disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export function MaintenanceBoard({
  issueReports = [],
  properties = [],
  requests,
}: {
  issueReports?: IssueReport[];
  properties?: Property[];
  requests: MaintenanceRequest[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(requests);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [filterStatus, setFilterStatus] = useState<FilterState>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<MaintenanceRequest | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MaintenanceRequest | null>(null);

  const filteredItems = filterStatus === "all" ? items : items.filter((item) => item.status === filterStatus);

  const groups = [
    ["Open", filteredItems.filter((item) => item.status === "urgent")],
    ["In Progress", filteredItems.filter((item) => item.status === "in_progress")],
    ["Awaiting Parts", filteredItems.filter((item) => item.status === "awaiting_parts")],
    ["Completed", filteredItems.filter((item) => item.status === "completed")],
    ["Cancelled", filteredItems.filter((item) => item.status === "cancelled")],
  ] as const;

  function moveRequest(id: string, status: MaintenanceRequest["status"]) {
    setItems((current) => current.map((r) => (r.id === id ? { ...r, status } : r)));
    const formData = new FormData();
    formData.set("id", id);
    formData.set("status", status);
    startTransition(async () => {
      const result = await updateWorkOrderStatus(formData);
      setMessage(result.message);
    });
  }

  function cycleFilter() {
    setFilterStatus((current) => {
      const idx = filterCycle.indexOf(current);
      return filterCycle[(idx + 1) % filterCycle.length];
    });
  }

  const filterLabel = filterStatus === "all" ? "All" : statusLabels[filterStatus as MaintenanceRequest["status"]];

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-secondary">Field Operations</p>
          <h1 className="font-heading text-3xl font-semibold text-primary">My Tasks</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="flex h-10 items-center gap-2 rounded-lg bg-primary-container px-4 text-sm font-semibold text-on-primary"
            onClick={() => setCreateOpen(true)}
            type="button"
          >
            <Plus size={16} />
            Add Work Order
          </button>
          <button
            className="flex h-10 items-center gap-2 rounded-full border border-outline-variant bg-surface-container px-3 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high"
            onClick={cycleFilter}
            title="Cycle through status filters"
          >
            <Filter size={16} />
            <span className="capitalize">{filterLabel}</span>
          </button>
        </div>
      </div>

      {(message || isPending) ? (
        <div className="mb-4 rounded-lg bg-secondary-container px-4 py-3 text-sm font-semibold text-on-secondary-container">
          {isPending ? "Updating work order..." : message}
        </div>
      ) : null}

      {issueReports.length > 0 ? (
        <div className="mb-6 rounded-xl border border-error/20 bg-error-container/20 p-4">
          <h2 className="font-heading text-xl font-semibold text-error">New Issue Reports</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {issueReports.slice(0, 4).map((report) => (
              <article className="rounded-lg bg-surface-container-lowest p-4" key={report.id}>
                <p className="text-sm font-semibold text-primary">{report.category}</p>
                <p className="mt-1 text-sm text-on-surface-variant">{report.description}</p>
                {report.attachment ? (
                  <a className="mt-3 inline-flex text-xs font-semibold text-secondary hover:underline" href={report.attachment.url ?? "#"} target={report.attachment.url ? "_blank" : undefined}>
                    {report.attachment.url ? "Open photo" : report.attachment.name}
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {filteredItems.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No requests match"
            description={`We couldn't find any maintenance requests with the status: ${filterLabel}. Try changing your filter or add a new order.`}
            icon={Filter}
            action={
              <button
                className="h-11 rounded-lg border border-outline-variant px-6 text-sm font-semibold"
                onClick={() => setFilterStatus("all")}
                type="button"
              >
                Clear Filter
              </button>
            }
          />
        </div>
      ) : (
        <>
          {/* Mobile */}
          <div className="space-y-4 md:hidden">
            {filteredItems.map((request) => {
              const isExpanded = expandedId === request.id;
              return (
                <div
                  className={`relative overflow-hidden rounded-lg border bg-surface-container-lowest p-4 shadow-sm ${
                    request.priority === "Critical" ? "border-l-[6px] border-l-error" : request.priority === "High Priority" ? "border-l-[6px] border-l-secondary-fixed" : "border-outline-variant"
                  }`}
                  key={request.id}
                >
                  {request.priority === "Critical" ? <div className="pointer-events-none absolute inset-0 bg-error-container/20" /> : null}
                  <div className="relative flex justify-between gap-3">
                    <div>
                      <h2 className="font-heading text-xl font-semibold text-on-surface">{request.property}</h2>
                      <p className="mt-1 flex items-center gap-1 text-sm text-on-surface-variant"><MapPin size={14} />{request.location}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <StatusPill tone={request.priority === "Critical" ? "danger" : "info"}>{request.priority}</StatusPill>
                      <StatusPill tone={request.status === "completed" ? "success" : request.status === "cancelled" ? "neutral" : "neutral"}>
                        {statusLabels[request.status]}
                      </StatusPill>
                    </div>
                  </div>
                  {isExpanded ? (
                    <div className="relative mt-3 rounded bg-surface-container p-3">
                      <p className="text-sm font-bold text-on-surface">{request.title}</p>
                      <p className="mt-1 text-sm text-on-surface-variant">{request.description}</p>
                      <div className="mt-2 text-xs text-on-surface-variant">
                        Assignee: <span className="font-semibold">{request.assignee}</span> · Estimate: <span className="font-semibold">{request.estimate}</span>
                      </div>
                    </div>
                  ) : null}
                  <div className="relative mt-3 flex items-center gap-2 text-sm font-semibold text-error">
                    <AlertTriangle size={16} />
                    Reported {request.reportedAgo}
                  </div>
                  <div className="relative mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-outline-variant/40 pt-4">
                    <button
                      className="flex items-center gap-1 text-sm font-semibold text-on-surface-variant hover:text-primary"
                      onClick={() => setExpandedId(isExpanded ? null : request.id)}
                    >
                      {isExpanded ? <><ChevronUp size={16} /> Less</> : <><ChevronDown size={16} /> Details</>}
                    </button>
                    <div className="flex gap-2">
                      {request.status !== "completed" && request.status !== "cancelled" ? (
                        <>
                          <button
                            className="h-9 rounded bg-secondary px-4 text-sm font-semibold text-on-secondary"
                            onClick={() => moveRequest(request.id, request.status === "in_progress" ? "completed" : "in_progress")}
                          >
                            {request.status === "in_progress" ? "Complete" : "Start"}
                          </button>
                          <button
                            className="h-9 rounded border border-outline-variant px-3 text-xs font-semibold hover:bg-surface-container-low"
                            onClick={() => moveRequest(request.id, "cancelled")}
                          >
                            Cancel
                          </button>
                        </>
                      ) : null}
                      <button
                        aria-label="Edit"
                        className="flex h-9 w-9 items-center justify-center rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
                        onClick={() => setEditTarget(request)}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        aria-label="Delete"
                        className="flex h-9 w-9 items-center justify-center rounded border border-error/30 text-error hover:bg-error-container/20"
                        onClick={() => setDeleteTarget(request)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop kanban */}
          <div className="hidden gap-4 overflow-x-auto pb-6 md:flex">
            {groups.map(([title, groupedItems]) => (
              <section className="w-[300px] shrink-0" key={title}>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-heading text-lg font-semibold text-primary">{title}</h2>
                  <span className="rounded-full bg-surface-container-high px-2 py-1 text-xs font-semibold text-on-surface-variant">{groupedItems.length}</span>
                </div>
                <div className="space-y-4">
                  {groupedItems.map((item) => {
                    const isExpanded = expandedId === item.id;
                    return (
                      <article className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4 ambient-shadow" key={item.id}>
                        <div className="flex justify-between gap-2">
                          <div className="min-w-0">
                            <div className="truncate text-xs font-semibold text-on-surface-variant">{item.property}</div>
                            <h3 className="mt-1 font-semibold text-primary">{item.title}</h3>
                          </div>
                          <StatusPill tone={item.priority === "Critical" ? "danger" : "neutral"}>{item.priority}</StatusPill>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-on-surface-variant line-clamp-2">{item.description}</p>
                        {isExpanded ? (
                          <div className="mt-2 rounded bg-surface-container p-2 text-xs text-on-surface-variant">
                            <p>Location: <span className="font-semibold">{item.location}</span></p>
                            <p>Reported: <span className="font-semibold">{item.reportedAgo}</span></p>
                          </div>
                        ) : null}
                        <div className="mt-4 flex items-center justify-between border-t border-outline-variant/40 pt-3 text-sm">
                          <span className="font-semibold text-on-surface-variant">{item.assignee}</span>
                          <span className="font-semibold text-primary">{item.estimate}</span>
                        </div>
                        <div className="mt-3 flex gap-1.5">
                          <button
                            className="h-8 flex-1 rounded border border-outline-variant text-xs font-semibold hover:bg-surface-container-low"
                            onClick={() => setExpandedId(isExpanded ? null : item.id)}
                          >
                            {isExpanded ? "Less" : "Details"}
                          </button>
                          {item.status !== "completed" && item.status !== "cancelled" ? (
                            <button
                              className="h-8 flex-1 rounded border border-outline-variant text-xs font-semibold hover:bg-surface-container-low"
                              onClick={() => moveRequest(item.id, "awaiting_parts")}
                            >
                              Parts
                            </button>
                          ) : null}
                          {item.status !== "completed" && item.status !== "cancelled" ? (
                            <button
                              className="h-8 flex-1 rounded bg-secondary text-xs font-semibold text-on-secondary"
                              onClick={() => moveRequest(item.id, "completed")}
                            >
                              Done
                            </button>
                          ) : item.status === "completed" ? (
                            <button
                              className="h-8 flex-1 rounded border border-outline-variant text-xs font-semibold"
                              onClick={() => moveRequest(item.id, "in_progress")}
                            >
                              Reopen
                            </button>
                          ) : null}
                          <button
                            aria-label="Edit"
                            className="flex h-8 w-8 items-center justify-center rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
                            onClick={() => setEditTarget(item)}
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            aria-label="Delete"
                            className="flex h-8 w-8 items-center justify-center rounded border border-error/30 text-error hover:bg-error-container/20"
                            onClick={() => setDeleteTarget(item)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </>
      )}

      {editTarget ? (
        <EditWorkOrderModal
          request={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => { setEditTarget(null); router.refresh(); }}
        />
      ) : null}

      {createOpen ? (
        <CreateWorkOrderModal
          onClose={() => setCreateOpen(false)}
          onSaved={() => {
            setCreateOpen(false);
            router.refresh();
          }}
          properties={properties}
        />
      ) : null}

      <ConfirmDialog
        confirmLabel="Delete Work Order"
        description={`"${deleteTarget?.title}" at ${deleteTarget?.property} will be permanently removed.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          const fd = new FormData();
          fd.set("id", deleteTarget.id);
          await deleteMaintenanceRequest(fd);
          setItems((current) => current.filter((r) => r.id !== deleteTarget.id));
          setDeleteTarget(null);
          router.refresh();
        }}
        open={Boolean(deleteTarget)}
        title="Delete Work Order?"
      />
    </div>
  );
}

function CreateWorkOrderModal({
  onClose,
  onSaved,
  properties,
}: {
  onClose: () => void;
  onSaved: () => void;
  properties: Property[];
}) {
  const attachInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [attachFile, setAttachFile] = useState<File | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-background/40 p-4 backdrop-blur-sm">
      <form
        className="w-full max-w-lg rounded-xl border border-outline-variant bg-surface p-6 ambient-shadow"
        onSubmit={(event) => {
          event.preventDefault();
          const form = event.currentTarget;
          startTransition(async () => {
            const result = await createMaintenanceRequest(new FormData(form));
            if (result.ok && result.id && attachFile) {
              const fd = new FormData();
              fd.set("file", attachFile);
              fd.set("requestId", result.id);
              try {
                await fetch("/api/storage/maintenance", { method: "POST", body: fd });
              } catch {
                // attachment upload failure does not block creation
              }
            }
            setMessage(result.message);
            if (result.ok) onSaved();
          });
        }}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-2xl font-semibold text-primary">Add Work Order</h2>
            <p className="text-sm text-on-surface-variant">Create a maintenance job for the team.</p>
          </div>
          <button className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>
        <div className="grid gap-4">
          <select className="h-11 rounded-lg border border-outline-variant px-3 text-sm" name="property">
            <option value="">Unassigned property</option>
            {properties.map((property) => (
              <option key={property.id} value={property.name}>{property.name}</option>
            ))}
          </select>
          <input className="h-11 rounded-lg border border-outline-variant px-4 text-sm" name="title" placeholder="Repair title" required />
          <textarea className="min-h-24 rounded-lg border border-outline-variant p-3 text-sm" name="description" placeholder="Repair notes, parts, or access instructions" />
          <div className="grid gap-3 sm:grid-cols-2">
            <select className="h-11 rounded-lg border border-outline-variant px-3 text-sm" name="priority" defaultValue="Routine">
              <option value="Critical">Critical</option>
              <option value="High Priority">High Priority</option>
              <option value="Routine">Routine</option>
              <option value="Low">Low</option>
            </select>
            <input className="h-11 rounded-lg border border-outline-variant px-4 text-sm" name="assignee" placeholder="Assignee" />
          </div>
          <input className="h-11 rounded-lg border border-outline-variant px-4 text-sm" name="estimate" placeholder="Estimated cost or TBD" />
          <div>
            <span className="mb-1 block text-xs font-semibold text-on-surface-variant">
              Photo / Receipt <span className="font-normal">(optional)</span>
            </span>
            <button
              className="flex h-10 items-center gap-2 rounded-lg border border-dashed border-outline-variant bg-surface-container-low px-4 text-xs font-semibold hover:bg-surface-container-high"
              onClick={() => attachInputRef.current?.click()}
              type="button"
            >
              <Paperclip size={14} />
              {attachFile ? attachFile.name : "Attach photo or receipt"}
            </button>
            <input
              accept="image/*,application/pdf"
              className="sr-only"
              ref={attachInputRef}
              type="file"
              onChange={(e) => {
                setAttachFile(e.currentTarget.files?.[0] ?? null);
                e.currentTarget.value = "";
              }}
            />
          </div>
        </div>
        {message ? <p className="mt-4 rounded-lg bg-secondary-container px-3 py-2 text-sm font-semibold text-on-secondary-container">{message}</p> : null}
        <div className="mt-6 flex gap-3">
          <button className="h-11 flex-1 rounded-lg border border-outline-variant text-sm font-semibold" onClick={onClose} type="button">Cancel</button>
          <button className="h-11 flex-1 rounded-lg bg-primary-container text-sm font-semibold text-on-primary disabled:opacity-60" disabled={isPending}>
            {isPending ? "Saving..." : "Create Work Order"}
          </button>
        </div>
      </form>
    </div>
  );
}
