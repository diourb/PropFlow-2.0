import { redirect } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { SectionCard } from "@/components/app/section-card";
import { StatusPill } from "@/components/app/status-pill";
import { GuestRequestForm } from "@/components/workflows/guest-request-form";
import { GuestStayActions } from "@/components/workflows/guest-portal-client";
import { getOperationsSnapshot } from "@/lib/data/repository";

export default async function GuestPortalPage() {
  const snapshot = await getOperationsSnapshot();
  const allowed = ["platform_admin", "workspace_admin", "manager", "guest"];
  if (!allowed.includes(snapshot.session.role)) redirect("/dashboard");
  const userEmail = snapshot.session.user.email;
  const activeBooking =
    snapshot.session.mode === "supabase"
      ? snapshot.bookings.find((b) => b.email === userEmail)
      : snapshot.bookings[0];

  return (
    <>
      <PageHeader
        title="Guest Portal"
        description="Stay details, requests, and communication in one place."
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard className="lg:col-span-2" title="Current Stay">
          {activeBooking ? (
            <div className="rounded-lg bg-surface-container-low p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-heading text-2xl font-semibold text-primary">
                    {activeBooking.property}
                  </h2>
                  <p className="mt-2 flex items-center gap-2 text-sm text-on-surface-variant">
                    <CalendarDays size={17} />
                    {activeBooking.stayDates}
                  </p>
                </div>
                <StatusPill
                  tone={
                    activeBooking.status === "Checked-in" ? "success"
                      : activeBooking.status === "Confirmed" ? "info"
                      : "neutral"
                  }
                >
                  {activeBooking.status}
                </StatusPill>
              </div>
              <GuestStayActions booking={activeBooking} />
            </div>
          ) : (
            <div className="py-6 text-center">
              <p className="text-sm text-on-surface-variant">No active stay found.</p>
            </div>
          )}
        </SectionCard>
        <SectionCard title="Request Help">
          <GuestRequestForm property={activeBooking?.property} />
        </SectionCard>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <SectionCard title="Open Requests">
          {snapshot.maintenanceRequests.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No open requests.</p>
          ) : (
            <div className="space-y-3">
              {snapshot.maintenanceRequests.slice(0, 4).map((request) => (
                <div className="rounded-lg border border-outline-variant/30 p-4" key={request.id}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-primary">{request.title}</p>
                    <StatusPill
                      tone={
                        request.status === "completed" ? "success"
                          : request.status === "urgent" ? "danger"
                          : "neutral"
                      }
                    >
                      {request.status.replace(/_/g, " ")}
                    </StatusPill>
                  </div>
                  <p className="mt-1 text-sm text-on-surface-variant">{request.reportedAgo}</p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
        <SectionCard title="Messages">
          {snapshot.notifications.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No messages.</p>
          ) : (
            <div className="space-y-3">
              {snapshot.notifications.slice(0, 4).map((notification) => (
                <div className="rounded-lg border border-outline-variant/30 p-4" key={notification.id}>
                  <p className="font-semibold text-primary">{notification.title}</p>
                  <p className="mt-1 text-sm text-on-surface-variant">{notification.body}</p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </>
  );
}
