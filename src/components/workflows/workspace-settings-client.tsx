"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, MoreVertical, Shield, Trash2, X } from "lucide-react";
import {
  connectIntegration,
  disconnectIntegration,
  removeTeamMember,
  saveNotificationPreferences,
  updateTeamMemberRole,
  updateWorkspaceSettings,
} from "@/app/actions";
import { ConfirmDialog } from "@/components/app/confirm-dialog";
import type { Role, TeamMember } from "@/lib/types";

/* ────────── General Settings Form ────────── */
export function GeneralSettingsForm({
  workspaceName,
  rentalModel,
}: {
  workspaceName: string;
  rentalModel: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const router = useRouter();

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        const fd = new FormData(event.currentTarget);
        startTransition(async () => {
          const result = await updateWorkspaceSettings(fd);
          setMessage(result.message);
          if (result.ok) router.refresh();
        });
      }}
    >
      <label className="block">
        <span className="mb-2 block text-xs font-semibold text-on-surface-variant">Workspace Name</span>
        <input
          className="h-12 w-full rounded-lg border border-outline-variant px-4 text-sm outline-none focus:border-secondary"
          defaultValue={workspaceName}
          name="name"
          placeholder="My Property Group"
          required
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-xs font-semibold text-on-surface-variant">Portfolio Type</span>
        <select
          className="h-12 w-full rounded-lg border border-outline-variant px-4 text-sm outline-none focus:border-secondary"
          defaultValue={rentalModel}
          name="rentalModel"
        >
          <option value="mixed">Mixed rentals</option>
          <option value="short_term">Short-term rentals</option>
          <option value="long_term">Long-term rentals</option>
        </select>
      </label>
      {message ? (
        <p className="rounded-lg bg-secondary-container px-3 py-2 text-sm font-semibold text-on-secondary-container">{message}</p>
      ) : null}
      <div className="flex justify-end gap-3">
        <button className="h-11 rounded-lg border border-outline-variant px-6 text-sm font-semibold" type="reset">
          Reset
        </button>
        <button
          className="h-11 rounded-lg bg-primary-container px-6 text-sm font-semibold text-on-primary disabled:opacity-60"
          disabled={isPending}
        >
          {isPending ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </form>
  );
}

/* ────────── Notifications Tab ────────── */
export function WorkspaceNotificationsTab() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  const channels: Array<[string, string, string]> = [
    ["email", "Email Summaries", "Receive daily performance overviews and digest emails."],
    ["sms", "SMS Maintenance Alerts", "Urgent maintenance issues sent directly to your phone."],
    ["push", "PWA Push Notifications", "Receive real-time alerts in the installable app."],
    ["in_app", "In-App Notifications", "Show alerts in the PropFlow notification center."],
  ];

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const fd = new FormData(event.currentTarget);
        startTransition(async () => {
          const result = await saveNotificationPreferences(fd);
          setMessage(result.message);
        });
      }}
    >
      {channels.map(([name, title, body]) => (
        <label
          className="flex items-center justify-between border-b border-outline-variant/20 py-3 last:border-0"
          key={name}
        >
          <span>
            <span className="block text-sm font-semibold">{title}</span>
            <span className="text-sm text-on-surface-variant">{body}</span>
          </span>
          <input className="h-5 w-5 accent-secondary" defaultChecked name={name} type="checkbox" />
        </label>
      ))}
      {message ? (
        <p className="rounded-lg bg-secondary-container px-3 py-2 text-sm font-semibold text-on-secondary-container">{message}</p>
      ) : null}
      <button
        className="h-11 rounded-lg bg-primary-container px-5 text-sm font-semibold text-on-primary disabled:opacity-60"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Saving..." : "Save Preferences"}
      </button>
    </form>
  );
}

/* ────────── Integration Connect/Disconnect ────────── */
type IntegrationActionState = { ok: boolean; message: string } | null;

export function IntegrationActions({
  integration,
  hasSupabase,
}: {
  integration: import("@/lib/types").Integration;
  hasSupabase: boolean;
}) {
  const { provider, status, lastSyncAt, metadata } = integration;
  const [connectState, connectAction, connectPending] = useActionState<IntegrationActionState, FormData>(
    connectIntegration,
    null,
  );
  const [disconnectState, disconnectAction, disconnectPending] = useActionState<IntegrationActionState, FormData>(
    disconnectIntegration,
    null,
  );
  const msg = connectState?.message ?? disconnectState?.message ?? "";

  if (!hasSupabase) {
    return (
      <p className="mt-3 text-xs text-on-surface-variant">
        Credentials not configured
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {lastSyncAt && (
        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant/70">
          <span>Last Sync</span>
          <span>{new Date(lastSyncAt).toLocaleString()}</span>
        </div>
      )}
      {typeof metadata?.last_sync_count === "number" && (
        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-secondary">
          <span>Synced Items</span>
          <span>{metadata.last_sync_count}</span>
        </div>
      )}
      <div className="flex items-center gap-2 pt-1">
        {status === "connected" ? (
          <form action={disconnectAction}>
            <input name="provider" type="hidden" value={provider} />
            <button
              className="flex h-8 items-center gap-1 rounded-lg border border-error/40 px-3 text-xs font-semibold text-error hover:bg-error/5 disabled:opacity-60"
              disabled={disconnectPending}
              type="submit"
            >
              {disconnectPending ? <Loader2 className="animate-spin" size={12} /> : null}
              Disconnect
            </button>
          </form>
        ) : (
          <form action={connectAction}>
            <input name="provider" type="hidden" value={provider} />
            <button
              className="flex h-8 items-center gap-1 rounded-lg bg-primary-container px-3 text-xs font-semibold text-on-primary hover:bg-primary disabled:opacity-60"
              disabled={connectPending}
              type="submit"
            >
              {connectPending ? <Loader2 className="animate-spin" size={12} /> : null}
              Connect
            </button>
          </form>
        )}
        {msg ? (
          <span className="text-xs text-on-surface-variant">{msg}</span>
        ) : null}
      </div>
    </div>
  );
}

/* ────────── Team Member Actions Dropdown ────────── */
const roleOptions: Array<{ value: Role; label: string }> = [
  { value: "workspace_admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "owner", label: "Owner" },
  { value: "cleaner", label: "Cleaner" },
  { value: "maintenance_tech", label: "Maintenance Tech" },
];

export function TeamMemberActionsMenu({ member }: { member: TeamMember }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
        setRoleOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="flex h-8 w-8 items-center justify-center rounded text-on-surface-variant hover:bg-surface-container"
        onClick={() => { setOpen((v) => !v); setRoleOpen(false); }}
        type="button"
      >
        <MoreVertical size={18} />
      </button>

      {open ? (
        <div className="absolute right-0 top-9 z-50 w-52 rounded-xl border border-outline-variant bg-surface shadow-lg">
          <div className="border-b border-outline-variant/30 px-4 py-2">
            <p className="text-xs font-semibold text-on-surface">{member.name}</p>
            <p className="text-xs text-on-surface-variant">{member.email}</p>
          </div>

          <div className="p-1">
            <button
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-on-surface hover:bg-surface-container-low"
              onClick={() => { setRoleOpen((v) => !v); }}
              type="button"
            >
              <Shield size={15} className="text-secondary" />
              Change Role
            </button>

            {roleOpen ? (
              <div className="ml-4 mt-1 space-y-0.5 border-l border-outline-variant/40 pl-3">
                {roleOptions.map(({ value, label }) => (
                  <button
                    className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs font-semibold ${value === member.role ? "text-secondary" : "text-on-surface hover:bg-surface-container-low"}`}
                    disabled={isPending || value === member.role}
                    key={value}
                    onClick={() => {
                      const formData = new FormData();
                      formData.set("id", member.id);
                      formData.set("role", value);
                      startTransition(async () => {
                        const result = await updateTeamMemberRole(formData);
                        setMessage(result.message);
                        setRoleOpen(false);
                        if (result.ok) router.refresh();
                      });
                    }}
                    type="button"
                  >
                    {value === member.role ? "✓ " : ""}
                    {label}
                  </button>
                ))}
              </div>
            ) : null}

            <a
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-on-surface hover:bg-surface-container-low"
              href={`mailto:${member.email}`}
              onClick={() => setOpen(false)}
            >
              <Mail size={15} className="text-secondary" />
              Send Email
            </a>

            <button
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-error hover:bg-error-container/20"
              onClick={() => { setConfirmRemove(true); setOpen(false); }}
              type="button"
            >
              <Trash2 size={15} />
              Remove Member
            </button>
          </div>

          {message ? (
            <div className="border-t border-outline-variant/30 px-3 py-2">
              <p className="text-xs font-semibold text-secondary">{message}</p>
            </div>
          ) : null}

          <div className="border-t border-outline-variant/30 p-1">
            <button
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-on-surface-variant hover:bg-surface-container-low"
              onClick={() => setOpen(false)}
              type="button"
            >
              <X size={13} />
              Close
            </button>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        confirmLabel="Remove Member"
        description={`${member.name} will be removed from the workspace. They will lose all access immediately.`}
        onCancel={() => setConfirmRemove(false)}
        onConfirm={async () => {
          const formData = new FormData();
          formData.set("id", member.id);
          const result = await removeTeamMember(formData);
          setMessage(result.message);
          setConfirmRemove(false);
          if (result.ok) router.refresh();
        }}
        open={confirmRemove}
        title="Remove Team Member?"
      />
    </div>
  );
}
