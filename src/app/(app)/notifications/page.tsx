import { BellOff, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { SectionCard } from "@/components/app/section-card";
import { StatusPill } from "@/components/app/status-pill";
import {
  markAllNotificationsRead as markAllNotificationsReadAction,
  markNotificationRead as markNotificationReadAction,
} from "@/app/actions";
import { getOperationsSnapshot } from "@/lib/data/repository";

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  async function markAllNotificationsRead() {
    "use server";
    await markAllNotificationsReadAction();
  }

  async function markNotificationRead(formData: FormData) {
    "use server";
    await markNotificationReadAction(formData);
  }

  const params = await searchParams;
  const status = params.status ?? "";
  const query = (params.q ?? "").toLowerCase().trim();
  const { notifications } = await getOperationsSnapshot();
  const visible = notifications.filter((notification) => {
    if (status === "unread" && notification.read) return false;
    if (status === "read" && !notification.read) return false;
    if (
      query &&
      !notification.title.toLowerCase().includes(query) &&
      !notification.body.toLowerCase().includes(query)
    ) {
      return false;
    }
    return true;
  });

  return (
    <>
      <PageHeader
        action={
          <form action={markAllNotificationsRead}>
            <button className="flex h-11 items-center gap-2 rounded-lg bg-primary-container px-4 text-sm font-semibold text-on-primary">
              <CheckCircle2 size={17} />
              Mark all read
            </button>
          </form>
        }
        title="Notifications"
        description="Operational alerts, provider setup notices, and workspace activity."
      />
      <form className="mb-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 ambient-shadow">
        <div className="flex flex-wrap gap-3">
          <input
            className="h-10 rounded-lg border border-outline-variant bg-surface px-3 text-sm"
            defaultValue={query}
            name="q"
            placeholder="Search notifications"
          />
          <select
            className="h-10 rounded-lg border border-outline-variant bg-surface px-3 text-sm"
            defaultValue={status}
            name="status"
          >
            <option value="">All statuses</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
          <button className="h-10 rounded-lg bg-primary-container px-4 text-sm font-semibold text-on-primary">
            Filter
          </button>
        </div>
      </form>
      <SectionCard title="Notification Center">
        {visible.length === 0 ? (
          <div className="rounded-xl border border-dashed border-outline-variant p-10 text-center">
            <BellOff className="mx-auto mb-3 text-outline" size={30} />
            <h2 className="font-heading text-xl font-semibold text-primary">
              You are all caught up
            </h2>
            <p className="mt-2 text-sm text-on-surface-variant">
              No notifications match the current filters.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map((notification) => (
              <article
                className={`rounded-lg border p-4 ${
                  notification.read
                    ? "border-outline-variant/40 bg-surface"
                    : "border-secondary/30 bg-secondary/5"
                }`}
                key={notification.id}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-primary">{notification.title}</h2>
                      <StatusPill tone={notification.read ? "neutral" : "success"}>
                        {notification.read ? "read" : "unread"}
                      </StatusPill>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-on-surface-variant">
                      {notification.body}
                    </p>
                  </div>
                  {!notification.read ? (
                    <form action={markNotificationRead}>
                      <input name="id" type="hidden" value={notification.id} />
                      <button className="h-9 whitespace-nowrap rounded-lg border border-outline-variant px-3 text-xs font-semibold hover:bg-surface-container-low">
                        Mark read
                      </button>
                    </form>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </SectionCard>
    </>
  );
}
