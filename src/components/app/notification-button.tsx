"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, BellOff, X } from "lucide-react";
import { markAllNotificationsRead, markNotificationRead } from "@/app/actions";
import type { NotificationItem } from "@/lib/types";

export function NotificationButton({ notifications }: { notifications: NotificationItem[] }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(notifications);
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const unread = items.filter((n) => !n.read);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function markAllRead() {
    setItems((current) => current.map((n) => ({ ...n, read: true })));
    await markAllNotificationsRead();
    router.refresh();
  }

  async function markRead(id: string) {
    setItems((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
    const formData = new FormData();
    formData.set("id", id);
    await markNotificationRead(formData);
    router.refresh();
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        aria-label="Notifications"
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high"
        onClick={() => setOpen((prev) => !prev)}
        title="Notifications"
      >
        <Bell size={20} />
        {unread.length > 0 ? (
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-error" />
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-xl border border-outline-variant bg-surface shadow-lg">
          <div className="flex items-center justify-between border-b border-outline-variant px-4 py-3">
            <Link
              className="font-heading text-base font-semibold text-primary hover:text-secondary"
              href="/notifications"
              onClick={() => setOpen(false)}
            >
              Notifications
            </Link>
            <div className="flex items-center gap-2">
              {unread.length > 0 ? (
                <button
                  className="text-xs font-semibold text-secondary hover:underline"
                  onClick={markAllRead}
                >
                  Mark all read
                </button>
              ) : null}
              <button
                aria-label="Close notifications"
                className="rounded p-1 text-on-surface-variant hover:bg-surface-container-high"
                onClick={() => setOpen(false)}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center text-on-surface-variant">
                <BellOff size={28} className="mb-2 opacity-40" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              items.map((notification) => (
                <button
                  className={`border-b border-outline-variant/30 px-4 py-3 last:border-0 ${
                    !notification.read ? "bg-secondary/5" : ""
                  } block w-full text-left hover:bg-surface-container-low`}
                  key={notification.id}
                  onClick={() => markRead(notification.id)}
                  type="button"
                >
                  <div className="flex items-start gap-2">
                    {!notification.read ? (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-secondary" />
                    ) : (
                      <span className="mt-1.5 h-2 w-2 shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-on-surface">
                        {notification.title}
                      </p>
                      <p className="mt-0.5 text-xs text-on-surface-variant">
                        {notification.body}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
          <Link
            className="block border-t border-outline-variant px-4 py-3 text-center text-xs font-semibold text-secondary hover:bg-surface-container-low"
            href="/notifications"
            onClick={() => setOpen(false)}
          >
            View notification center
          </Link>
        </div>
      ) : null}
    </div>
  );
}
