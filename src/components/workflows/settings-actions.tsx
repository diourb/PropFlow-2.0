"use client";

import { useRef, useState, useTransition } from "react";
import { UserPlus, X } from "lucide-react";
import { inviteMember } from "@/app/actions";
import type { Role } from "@/lib/types";

const inviteRoles: Role[] = [
  "workspace_admin",
  "manager",
  "owner",
  "cleaner",
  "maintenance_tech",
  "guest",
];

export function InviteMemberDialog() {
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <button
        className="flex h-10 w-full scroll-mt-28 items-center justify-center gap-2 rounded-lg bg-primary-container px-4 text-sm font-semibold text-on-primary sm:w-auto"
        onClick={() => {
          setOpen(true);
          setMessage("");
        }}
        type="button"
      >
        <UserPlus size={17} />
        Invite Member
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-on-background/40 p-4 py-8 backdrop-blur-sm sm:items-center">
          <form
            className="w-full max-w-md rounded-xl border border-outline-variant bg-surface p-6 ambient-shadow"
            onSubmit={(event) => {
              event.preventDefault();
              const form = formRef.current;
              if (!form) return;
              startTransition(async () => {
                const result = await inviteMember(new FormData(form));
                setMessage(result.message);
                if (result.ok) form.reset();
              });
            }}
            ref={formRef}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-heading text-2xl font-semibold text-primary">
                  Invite Member
                </h2>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Send a workspace invitation with the right operational role.
                </p>
              </div>
              <button
                className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container"
                onClick={() => setOpen(false)}
                type="button"
              >
                <X size={20} />
              </button>
            </div>
            <label className="mb-4 block">
              <span className="mb-2 block text-xs font-semibold text-on-surface-variant">
                Email
              </span>
              <input
                className="h-11 w-full rounded-lg border border-outline-variant px-4 text-sm"
                name="email"
                placeholder="teammate@example.com"
                required
                type="email"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-on-surface-variant">
                Role
              </span>
              <select
                className="h-11 w-full rounded-lg border border-outline-variant px-3 text-sm"
                defaultValue="manager"
                name="role"
              >
                {inviteRoles.map((role) => (
                  <option key={role} value={role}>
                    {role.replace("_", " ")}
                  </option>
                ))}
              </select>
            </label>
            {message ? (
              <p className="mt-4 rounded-lg bg-secondary-container px-3 py-2 text-sm font-semibold text-on-secondary-container">
                {message}
              </p>
            ) : null}
            <button
              className="mt-6 h-11 w-full rounded-lg bg-primary-container text-sm font-semibold text-on-primary disabled:opacity-60"
              disabled={isPending}
            >
              {isPending ? "Sending..." : "Create Invite"}
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}
