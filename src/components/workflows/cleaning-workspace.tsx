"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Clock,
  Home,
  ImagePlus,
  MapPin,
  Navigation,
  PauseCircle,
  PlayCircle,
  Sparkles,
  X,
} from "lucide-react";
import { createCleaningTask, submitIssueReport, updateCleaningChecklistItem, updateCleaningStatus } from "@/app/actions";
import { EmptyState } from "@/components/app/empty-state";
import type { ChecklistItem, CleaningTask, Property } from "@/lib/types";

export function CleaningWorkspace({
  checklistItems,
  properties = [],
  tasks,
}: {
  checklistItems: ChecklistItem[];
  properties?: Property[];
  tasks: CleaningTask[];
}) {
  const router = useRouter();
  const [taskStatuses, setTaskStatuses] = useState<Record<string, CleaningTask["status"]>>(
    Object.fromEntries(tasks.map((t) => [t.id, t.status])),
  );
  const [checked, setChecked] = useState<string[]>(
    checklistItems.filter((item) => item.completed).map((item) => item.id),
  );
  const [activeTab, setActiveTab] = useState<"pending" | "completed">("pending");
  const [activeTaskId, setActiveTaskId] = useState(
    tasks.find((task) => task.status !== "completed")?.id ?? tasks[0]?.id ?? "",
  );
  const [issueOpen, setIssueOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [completionPhoto, setCompletionPhoto] = useState<File | null>(null);
  const [completionPreview, setCompletionPreview] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isSubmittingIssue, startIssueTransition] = useTransition();
  const [isUpdatingStatus, startStatusTransition] = useTransition();
  const [isCreating, startCreateTransition] = useTransition();
  const completionInputRef = useRef<HTMLInputElement>(null);

  const allTasks = useMemo(
    () => tasks.map((t) => ({ ...t, status: taskStatuses[t.id] ?? t.status })),
    [tasks, taskStatuses],
  );
  const pendingTasks = useMemo(
    () => allTasks.filter((t) => t.status !== "completed"),
    [allTasks],
  );
  const completedTasks = useMemo(
    () => allTasks.filter((t) => t.status === "completed"),
    [allTasks],
  );
  const visibleTasks = useMemo(
    () => (activeTab === "pending" ? pendingTasks : completedTasks),
    [activeTab, completedTasks, pendingTasks],
  );
  const task = visibleTasks.find((item) => item.id === activeTaskId) ?? visibleTasks[0] ?? allTasks[0];
  const taskStatus = task ? (taskStatuses[task.id] ?? task.status) : "pending";
  const taskItems = useMemo(
    () => checklistItems.filter((item) => item.cleaningTaskId === task?.id),
    [checklistItems, task?.id],
  );
  const checkedTaskItems = taskItems.filter((item) => checked.includes(item.id));
  const allItemsChecked = taskItems.length > 0 && checkedTaskItems.length === taskItems.length;

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const grouped = useMemo(
    () =>
      taskItems.reduce<Record<string, ChecklistItem[]>>((acc, item) => {
        acc[item.room] = acc[item.room] ? [...acc[item.room], item] : [item];
        return acc;
      }, {}),
    [taskItems],
  );

  function updateStatus(id: string, status: CleaningTask["status"]) {
    setTaskStatuses((prev) => ({ ...prev, [id]: status }));
    const fd = new FormData();
    fd.set("id", id);
    fd.set("status", status);
    startStatusTransition(async () => {
      await updateCleaningStatus(fd);
    });
  }

  if (!task) {
    return (
      <div className="mt-8">
        <EmptyState
          title="No Cleaning Tasks"
          description="New short-term bookings will generate turnover work automatically. You can also manually add a task."
          icon={Home}
          action={
            <button
              className="h-11 rounded-lg bg-primary-container px-6 text-sm font-semibold text-on-primary"
              onClick={() => setCreateOpen(true)}
              type="button"
            >
              Add Your First Task
            </button>
          }
        />
        <CleaningCreateModal
          isPending={isCreating}
          onClose={() => setCreateOpen(false)}
          onSubmit={(formData) => {
            startCreateTransition(async () => {
              const result = await createCleaningTask(formData);
              setMessage(result.message);
              if (result.ok) {
                setCreateOpen(false);
                router.refresh();
              }
            });
          }}
          open={createOpen}
          properties={properties}
        />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-12rem)] rounded-xl bg-primary-container p-8 text-on-primary ambient-shadow">
        <div className="flex h-full min-h-[560px] flex-col items-center justify-center text-center">
          <CheckCircle2 className="mb-8 text-secondary-fixed" size={86} />
          <h1 className="font-heading text-3xl font-semibold">Issue Reported</h1>
          <p className="mt-4 max-w-sm text-primary-fixed-dim">
            The maintenance team has been notified and will review your report shortly.
          </p>
          {message ? <p className="mt-3 text-sm text-secondary-fixed">{message}</p> : null}
          <div className="mt-10 flex w-full max-w-sm flex-col gap-3">
            <button
              className="h-12 rounded-lg bg-secondary text-sm font-semibold text-on-secondary"
              onClick={() => { setSubmitted(false); setIssueOpen(false); setPreview(null); setMessage(""); }}
            >
              Back to Tasks
            </button>
            <a
              className="flex h-12 items-center justify-center rounded-lg border border-primary-fixed-dim/40 text-sm font-semibold"
              href="/field/maintenance"
            >
              View Report
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative pb-24">
      {/* Header with tab toggle */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-3xl font-semibold text-primary">Today&apos;s Tasks</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            {allTasks.length} assigned {allTasks.length === 1 ? "property" : "properties"}
          </p>
        </div>
        <div className="flex rounded-lg border border-outline-variant/30 bg-surface-container-high p-1">
          <button
            className={`rounded px-6 py-2 text-sm font-semibold transition ${activeTab === "pending" ? "bg-surface-container-lowest text-primary shadow-sm" : "text-on-surface-variant"}`}
            onClick={() => setActiveTab("pending")}
          >
            Pending
            {pendingTasks.length > 0 ? (
              <span className="ml-1.5 rounded-full bg-secondary px-1.5 py-0.5 text-xs text-on-secondary">{pendingTasks.length}</span>
            ) : null}
          </button>
          <button
            className={`rounded px-6 py-2 text-sm font-semibold transition ${activeTab === "completed" ? "bg-surface-container-lowest text-primary shadow-sm" : "text-on-surface-variant"}`}
            onClick={() => setActiveTab("completed")}
          >
            Completed
            {completedTasks.length > 0 ? (
              <span className="ml-1.5 rounded-full bg-surface-container px-1.5 py-0.5 text-xs text-on-surface-variant">{completedTasks.length}</span>
            ) : null}
          </button>
        </div>
        <button
          className="h-10 rounded-lg bg-primary-container px-4 text-sm font-semibold text-on-primary"
          onClick={() => setCreateOpen(true)}
          type="button"
        >
          Add Cleaning Task
        </button>
      </div>

      {activeTab === "completed" && completedTasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest p-10 text-center">
          <p className="text-sm text-on-surface-variant">No completed tasks yet.</p>
        </div>
      ) : (
        <>
          {visibleTasks.length > 1 ? (
            <div className="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {visibleTasks.map((item) => (
                <button
                  className={`rounded-lg border p-4 text-left transition ${
                    item.id === task.id
                      ? "border-secondary bg-secondary/10"
                      : "border-outline-variant/40 bg-surface-container-lowest hover:border-secondary/40"
                  }`}
                  key={item.id}
                  onClick={() => setActiveTaskId(item.id)}
                  type="button"
                >
                  <span className="block truncate text-sm font-semibold text-primary">{item.property}</span>
                  <span className="mt-1 block truncate text-xs text-on-surface-variant">{item.type}</span>
                  <span className="mt-2 block text-xs font-semibold text-secondary">
                    {item.completed}/{item.total} items · Check-in {item.checkIn}
                  </span>
                </button>
              ))}
            </div>
          ) : null}

          {/* Task card */}
          <section className="mb-6 overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest ambient-shadow">
            <div
              className="relative h-44 bg-cover bg-center md:h-56"
              style={{ backgroundImage: `url(${task.image})` }}
            >
              <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full border border-secondary/20 bg-secondary-container px-3 py-1 text-xs font-semibold text-on-secondary-container shadow-sm">
                <Clock size={14} />
                Check-in {task.checkIn}
              </span>
              {taskStatus === "in_progress" ? (
                <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-on-secondary shadow-sm">
                  In Progress
                </span>
              ) : taskStatus === "completed" ? (
                <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-on-secondary shadow-sm">
                  <CheckCircle2 size={13} />
                  Guest Ready
                </span>
              ) : null}
            </div>
            <div className="p-5">
              <div className="flex justify-between gap-4">
                <div>
                  <h2 className="font-heading text-2xl font-semibold text-primary">{task.property}</h2>
                  <p className="mt-1 flex items-center gap-1 text-sm text-on-surface-variant">
                    <MapPin size={16} />
                    {task.address}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <span className="block font-semibold text-primary">Turnover</span>
                  <span className="text-on-surface-variant">{task.type}</span>
                </div>
              </div>
              <div className="mt-5 flex gap-3">
                {taskStatus === "completed" ? (
                  <div className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-surface-container-high text-sm font-semibold text-on-surface">
                    <CheckCircle2 size={18} className="text-secondary" />
                    Task Complete
                  </div>
                ) : (
                  <button
                    className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition ${taskStatus === "in_progress" ? "bg-surface-container-high text-on-surface" : "bg-primary-container text-on-primary hover:bg-primary"}`}
                    disabled={isUpdatingStatus}
                    onClick={() => updateStatus(task.id, taskStatus === "in_progress" ? "pending" : "in_progress")}
                  >
                    {taskStatus === "in_progress" ? <><PauseCircle size={18} />Pause Cleaning</> : <><PlayCircle size={18} />Start Cleaning</>}
                  </button>
                )}
                {taskStatus === "in_progress" && allItemsChecked ? (
                  <button
                    className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-secondary text-sm font-semibold text-on-secondary hover:bg-secondary-fixed disabled:opacity-60"
                    disabled={isUpdatingStatus || photoUploading}
                    onClick={async () => {
                      if (completionPhoto) {
                        setPhotoUploading(true);
                        const fd = new FormData();
                        fd.set("file", completionPhoto);
                        fd.set("taskId", task.id);
                        try {
                          await fetch("/api/storage/cleaning", { method: "POST", body: fd });
                        } catch {
                          // Photo upload failure does not block marking complete
                        } finally {
                          setPhotoUploading(false);
                        }
                      }
                      updateStatus(task.id, "completed");
                    }}
                  >
                    {photoUploading ? (
                      <span className="animate-spin">⏳</span>
                    ) : (
                      <Sparkles size={18} />
                    )}
                    {photoUploading ? "Uploading…" : "Mark Guest Ready"}
                  </button>
                ) : null}
                <button
                  aria-label="Open in Google Maps"
                  className="flex h-11 w-12 items-center justify-center rounded-lg border border-outline-variant text-primary hover:bg-surface-container-high"
                  onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(task.address)}`, "_blank")}
                >
                  <Navigation size={18} />
                </button>
              </div>
              {taskStatus === "in_progress" && allItemsChecked ? (
                <div className="mt-4 rounded-lg border border-dashed border-outline-variant bg-surface-container-low p-4">
                  <p className="mb-2 text-xs font-semibold text-on-surface-variant">
                    Completion Photo <span className="font-normal">(optional — attach a photo showing the property is guest-ready)</span>
                  </p>
                  {completionPreview ? (
                    <div className="relative mb-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt="Completion preview"
                        className="h-32 w-full rounded-lg object-cover"
                        src={completionPreview}
                      />
                      <button
                        aria-label="Remove photo"
                        className="absolute right-2 top-2 rounded-full bg-on-background/60 p-1 text-white hover:bg-on-background/80"
                        onClick={() => { setCompletionPhoto(null); setCompletionPreview(null); }}
                        type="button"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : null}
                  <button
                    className="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-xs font-semibold hover:bg-surface-container-high"
                    onClick={() => completionInputRef.current?.click()}
                    type="button"
                  >
                    <ImagePlus size={15} />
                    {completionPhoto ? "Replace Photo" : "Attach Completion Photo"}
                  </button>
                  <input
                    accept="image/*"
                    className="sr-only"
                    ref={completionInputRef}
                    type="file"
                    onChange={(e) => {
                      const file = e.currentTarget.files?.[0];
                      if (file) {
                        setCompletionPhoto(file);
                        setCompletionPreview(URL.createObjectURL(file));
                      }
                      e.currentTarget.value = "";
                    }}
                  />
                </div>
              ) : null}
              {taskStatus === "in_progress" && !allItemsChecked && taskItems.length > 0 ? (
                <p className="mt-3 text-xs text-on-surface-variant">
                  Complete all checklist items to unlock &quot;Mark Guest Ready&quot;.
                </p>
              ) : null}
            </div>
          </section>

          {/* Checklist */}
          <section className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-5">
            <div className="mb-5 flex items-end justify-between">
              <h2 className="font-heading text-xl font-semibold text-primary">Task Checklist</h2>
              <span className="text-xs font-bold text-secondary">
                {checkedTaskItems.length} / {taskItems.length} Completed
              </span>
            </div>
            <div className="space-y-6">
              {Object.entries(grouped).map(([room, items]) => (
                <div key={room}>
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-on-surface-variant">{room}</h3>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <label
                        className={`flex cursor-pointer items-start gap-4 rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-3 transition hover:border-secondary/50 ${checked.includes(item.id) ? "bg-secondary/5" : ""}`}
                        key={item.id}
                      >
                        <input
                          checked={checked.includes(item.id)}
                          className="mt-0.5 h-6 w-6 rounded border-outline-variant text-secondary focus:ring-secondary/50"
                          onChange={(event) => {
                            const nextCompleted = event.currentTarget.checked;
                            setChecked((current) =>
                              nextCompleted
                                ? [...new Set([...current, item.id])]
                                : current.filter((id) => id !== item.id),
                            );
                            const formData = new FormData();
                            formData.set("itemId", item.id);
                            formData.set("completed", String(nextCompleted));
                            startTransition(() => { void updateCleaningChecklistItem(formData); });
                          }}
                          type="checkbox"
                        />
                        <span className={`flex-1 text-sm font-medium ${checked.includes(item.id) ? "text-on-surface-variant line-through" : "text-primary"}`}>
                          {item.label}
                          {item.warning ? <AlertTriangle className="ml-2 inline text-error" size={16} /> : null}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {isPending ? <p className="mt-4 text-xs font-semibold text-secondary">Saving checklist...</p> : null}
          </section>
        </>
      )}

      {/* FAB - Report Issue */}
      <button
        className="fixed bottom-6 right-6 z-30 flex h-14 items-center gap-2 rounded-full bg-error px-5 text-sm font-semibold text-on-error shadow-xl transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={!mounted}
        onClick={() => setIssueOpen(true)}
      >
        <AlertTriangle size={19} />
        Report Issue
      </button>

      {/* Issue Report Modal */}
      {issueOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-background/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-surface ambient-shadow-lg">
            <div className="flex items-center justify-between border-b border-outline-variant p-4">
              <h2 className="font-heading text-xl font-semibold text-primary">Report an Issue</h2>
              <button className="rounded-full p-2 hover:bg-surface-container-high" onClick={() => setIssueOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form
              className="space-y-5 p-6"
              onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                startIssueTransition(async () => {
                  const result = await submitIssueReport(formData);
                  setMessage(result.message);
                  if (result.ok) setSubmitted(true);
                });
              }}
            >
              <input name="cleaningTaskId" type="hidden" value={task.id} />
              <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-outline-variant bg-surface-container-low p-8 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container text-on-primary">
                  <Camera size={22} />
                </span>
                <span className="text-sm font-semibold text-on-surface-variant">
                  {preview ? "Photo selected" : "Tap to take a photo or upload"}
                </span>
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt="Issue preview" className="mt-2 h-28 w-full rounded-lg object-cover" src={preview} />
                ) : null}
                <input
                  accept="image/*"
                  className="sr-only"
                  name="photo"
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0];
                    setPreview(file ? URL.createObjectURL(file) : null);
                  }}
                  type="file"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-primary">Issue Category</span>
                <select className="h-12 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 text-sm outline-none focus:border-secondary" name="category">
                  <option>Maintenance</option>
                  <option>Damage</option>
                  <option>Missing Items</option>
                  <option>Cleaning Supply Needed</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-primary">Description</span>
                <textarea
                  className="min-h-28 w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-4 text-sm outline-none focus:border-secondary"
                  name="description"
                  placeholder="Describe the issue in detail..."
                  required
                />
              </label>
              {message ? <p className="rounded-lg bg-secondary-container px-3 py-2 text-sm font-semibold text-on-secondary-container">{message}</p> : null}
              <button
                className="h-12 w-full rounded-lg bg-secondary text-sm font-semibold text-on-secondary disabled:opacity-60"
                disabled={isSubmittingIssue}
              >
                {isSubmittingIssue ? "Submitting…" : "Submit Report"}
              </button>
            </form>
          </div>
        </div>
      ) : null}

      <CleaningCreateModal
        isPending={isCreating}
        onClose={() => setCreateOpen(false)}
        onSubmit={(formData) => {
          startCreateTransition(async () => {
            const result = await createCleaningTask(formData);
            setMessage(result.message);
            if (result.ok) {
              setCreateOpen(false);
              router.refresh();
            }
          });
        }}
        open={createOpen}
        properties={properties}
      />
    </div>
  );
}

function CleaningCreateModal({
  isPending,
  onClose,
  onSubmit,
  open,
  properties,
}: {
  isPending: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  open: boolean;
  properties: Property[];
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-background/40 p-4 backdrop-blur-sm">
      <form
        className="w-full max-w-lg rounded-xl border border-outline-variant bg-surface p-6 ambient-shadow"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(new FormData(event.currentTarget));
        }}
      >
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-semibold text-primary">
              Add Cleaning Task
            </h2>
            <p className="text-sm text-on-surface-variant">
              Schedule a turnover, inspection, or reset for the cleaning team.
            </p>
          </div>
          <button className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>
        <div className="grid gap-4">
          <select className="h-11 rounded-lg border border-outline-variant px-3 text-sm" name="property" required>
            <option value="">Select property</option>
            {properties.map((property) => (
              <option key={property.id} value={property.name}>{property.name}</option>
            ))}
          </select>
          <input className="h-11 rounded-lg border border-outline-variant px-4 text-sm" name="type" placeholder="Turnover - Standard Reset" />
          <input className="h-11 rounded-lg border border-outline-variant px-4 text-sm" name="checkIn" placeholder="3:00 PM" />
        </div>
        <div className="mt-6 flex gap-3">
          <button className="h-11 flex-1 rounded-lg border border-outline-variant text-sm font-semibold" onClick={onClose} type="button">
            Cancel
          </button>
          <button className="h-11 flex-1 rounded-lg bg-primary-container text-sm font-semibold text-on-primary disabled:opacity-60" disabled={isPending}>
            {isPending ? "Saving..." : "Create Task"}
          </button>
        </div>
      </form>
    </div>
  );
}
