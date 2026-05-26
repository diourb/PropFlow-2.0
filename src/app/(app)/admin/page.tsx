import { redirect } from "next/navigation";
import { AlertTriangle, Database, Server, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { SectionCard } from "@/components/app/section-card";
import { StatCard } from "@/components/app/stat-card";
import { StatusPill } from "@/components/app/status-pill";
import { getOperationsSnapshot, getAdminDashboardRecord } from "@/lib/data/repository";
import { platformMetrics } from "@/lib/demo-data";

const icons = [Database, ShieldCheck, Server, AlertTriangle];

export default async function AdminPage() {
  const { session } = await getOperationsSnapshot();

  if (session.role !== "platform_admin") {
    redirect("/dashboard");
  }

  const { workspaces } = await getAdminDashboardRecord();
  const totalWorkspaces = workspaces.length;
  const activeWorkspaces = workspaces.filter((ws) => ws.status === "active").length;
  const totalMembers = workspaces.reduce((sum, ws) => sum + ws.members, 0);

  const metricsOverride = [
    { label: "Total Workspaces", value: String(totalWorkspaces), delta: `${activeWorkspaces} active` },
    { label: "Total Members", value: String(totalMembers), delta: "Across all workspaces" },
    ...platformMetrics.slice(2),
  ];

  return (
    <>
      <PageHeader
        eyebrow="Admin Oversight"
        title="Platform Health"
        description="System status, subscription health, workspace growth, and pending administrative actions."
      />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {metricsOverride.map((metric, index) => (
          <StatCard
            delta={metric.delta}
            icon={icons[index]}
            key={metric.label}
            label={metric.label}
            tone={index === 3 ? "error" : "secondary"}
            value={metric.value}
          />
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <SectionCard className="lg:col-span-2" title="All Workspaces">
          {workspaces.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No workspaces yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead className="bg-surface-container-low text-xs uppercase text-outline">
                  <tr>
                    <th className="p-4">Workspace</th>
                    <th className="p-4">Plan</th>
                    <th className="p-4">Members</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40">
                  {workspaces.map((ws) => (
                    <tr key={ws.id}>
                      <td className="p-4 font-semibold">{ws.name}</td>
                      <td className="p-4 capitalize">{ws.plan}</td>
                      <td className="p-4">{ws.members}</td>
                      <td className="p-4">
                        <StatusPill
                          tone={
                            ws.status === "active"
                              ? "success"
                              : ws.status === "past_due"
                                ? "danger"
                                : "neutral"
                          }
                        >
                          {ws.status}
                        </StatusPill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Pending Actions">
          <div className="space-y-4">
            {[
              ["Review Suspended Account", "Workspace flagged for TOS violation.", "danger"],
              ["Enterprise KYC Approval", "Apex Property Group pending final sign-off.", "info"],
              ["Partner API Access", "Airbnb and VRBO connectors awaiting credentials.", "neutral"],
            ].map(([title, body, tone]) => (
              <div
                className="rounded-lg border border-transparent p-3 hover:border-outline-variant/30 hover:bg-surface"
                key={title}
              >
                <StatusPill tone={tone as "danger" | "info" | "neutral"}>{title}</StatusPill>
                <p className="mt-2 text-sm text-on-surface-variant">{body}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </>
  );
}
