import Image from "next/image";
import Link from "next/link";
import { CreditCard, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { SectionCard } from "@/components/app/section-card";
import { StatusPill } from "@/components/app/status-pill";
import { InviteMemberDialog } from "@/components/workflows/settings-actions";
import {
  GeneralSettingsForm,
  IntegrationActions,
  TeamMemberActionsMenu,
  WorkspaceNotificationsTab,
} from "@/components/workflows/workspace-settings-client";
import { getOperationsSnapshot } from "@/lib/data/repository";
import { hasSupabaseEnv } from "@/lib/supabase/env";

const tabs = [
  { id: "general", label: "General" },
  { id: "team", label: "Team" },
  { id: "billing", label: "Billing" },
  { id: "notifications", label: "Notifications" },
  { id: "integrations", label: "API/Integrations" },
];

export default async function WorkspaceSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = "team" } = await searchParams;
  const { integrations, teamMembers, session } = await getOperationsSnapshot();
  const supabaseEnabled = hasSupabaseEnv();
  const { workspace } = session;

  return (
    <>
      <PageHeader
        title="Workspace Settings"
        description="Manage workspace access, billing status, notification channels, and integrations."
      />
      <div className="mb-8 flex gap-8 overflow-x-auto border-b border-outline-variant">
        {tabs.map(({ id, label }) => (
          <Link
            className={`shrink-0 border-b-2 py-3 text-sm font-semibold transition ${
              id === tab ? "border-secondary text-secondary" : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
            href={`?tab=${id}`}
            key={id}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* ── General ── */}
      {tab === "general" && (
        <div className="grid gap-8 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <SectionCard title="General Settings">
              <GeneralSettingsForm
                rentalModel={workspace.rentalModel ?? "mixed"}
                workspaceName={workspace.name}
              />
            </SectionCard>
          </div>
          <BillingSidebar workspace={workspace} />
        </div>
      )}

      {/* ── Team ── */}
      {tab === "team" && (
        <div className="grid gap-8 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <SectionCard action={<InviteMemberDialog />} title="Team Members">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="bg-surface-container-low text-xs uppercase text-on-surface-variant">
                    <tr>
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/40">
                    {teamMembers.map((member) => (
                      <tr key={member.id}>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            {member.avatar ? (
                              <Image
                                alt={member.name}
                                className="rounded-full object-cover"
                                height={40}
                                src={member.avatar}
                                style={{ height: 40, width: 40 }}
                                width={40}
                              />
                            ) : (
                              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-tertiary-fixed font-semibold">
                                {member.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                              </span>
                            )}
                            <span>
                              <span className="block font-semibold">{member.name}</span>
                              <span className="text-xs text-on-surface-variant">{member.email}</span>
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 capitalize">{member.role.replace(/_/g, " ")}</td>
                        <td className="px-4 py-4">
                          <StatusPill tone={member.status === "active" ? "success" : "neutral"}>
                            {member.status}
                          </StatusPill>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <TeamMemberActionsMenu member={member} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </div>
          <BillingSidebar workspace={workspace} />
        </div>
      )}

      {/* ── Integrations ── */}
      {tab === "integrations" && (
        <div className="grid gap-8 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <SectionCard title="Credential-Gated Integrations">
              {!supabaseEnabled ? (
                <p className="mb-4 rounded-lg border border-outline-variant bg-surface-container-low p-3 text-sm text-on-surface-variant">
                  OAuth integrations require Supabase configuration. Demo mode shows integration status only.
                </p>
              ) : null}
              <div className="grid gap-4 md:grid-cols-2">
                {integrations.map((integration) => (
                  <div className="rounded-lg border border-outline-variant/40 bg-surface p-4" key={integration.id}>
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-primary capitalize">
                        {integration.name.replace(/_/g, " ")}
                      </h3>
                      <StatusPill
                        tone={
                          integration.status === "connected" ? "success"
                            : integration.status === "credential_required" ? "danger"
                            : "neutral"
                        }
                      >
                        {integration.status.replace(/_/g, " ")}
                      </StatusPill>
                    </div>
                    <p className="text-sm leading-6 text-on-surface-variant">{integration.description}</p>
                    <p className="mt-3 text-xs font-semibold text-outline">{integration.lastSync}</p>
                    <IntegrationActions
                      hasSupabase={supabaseEnabled}
                      integration={integration}
                    />
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
          <BillingSidebar workspace={workspace} />
        </div>
      )}

      {/* ── Billing ── */}
      {tab === "billing" && (
        <div className="max-w-lg">
          <SectionCard title="Current Plan">
            <div className="mb-6 flex items-start justify-between">
              <h2 className="font-heading text-2xl font-bold">{workspace.plan}</h2>
              <StatusPill tone="success">Active</StatusPill>
            </div>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between border-b border-outline-variant/20 pb-3">
                <span>Billing Cycle</span>
                <span>Monthly</span>
              </div>
              <div className="flex justify-between border-b border-outline-variant/20 pb-3">
                <span>Properties</span>
                <span>Up to 50</span>
              </div>
              <div className="flex justify-between">
                <span>Next Invoice</span>
                <span>Awaiting billing setup</span>
              </div>
            </div>
            <Link
              className="mt-6 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-outline-variant text-sm font-semibold hover:bg-surface-container-low"
              href="/pricing"
            >
              <ExternalLink size={15} />
              View Plans &amp; Pricing
            </Link>
          </SectionCard>
          <SectionCard className="mt-6" title="Payment Method">
            <div className="mb-4 flex items-center justify-between rounded-lg border border-outline-variant/50 bg-surface p-4">
              <div className="flex items-center gap-4">
                <span className="flex h-9 w-12 items-center justify-center rounded border border-outline-variant/40 bg-white text-xs font-bold text-primary">PP</span>
                <div>
                  <p className="font-semibold">PayPal billing</p>
                  <p className="text-xs text-on-surface-variant">Setup required for automated billing</p>
                </div>
              </div>
              <CreditCard className="text-secondary" size={20} />
            </div>
            <Link
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-outline-variant text-sm font-semibold hover:bg-surface-container-low"
              href="/pricing"
            >
              <ExternalLink size={15} />
              Configure Billing
            </Link>
          </SectionCard>
        </div>
      )}

      {/* ── Notifications ── */}
      {tab === "notifications" && (
        <div className="max-w-xl">
          <SectionCard title="Notification Channels">
            <WorkspaceNotificationsTab />
          </SectionCard>
        </div>
      )}
    </>
  );
}

function BillingSidebar({ workspace }: { workspace: { plan: string } }) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-primary-container p-6 text-on-primary ambient-shadow">
        <p className="text-xs font-bold uppercase tracking-wide text-on-primary/70">Current Plan</p>
        <div className="mt-2 flex items-start justify-between">
          <h2 className="font-heading text-2xl font-bold">{workspace.plan}</h2>
          <StatusPill tone="success">Active</StatusPill>
        </div>
        <div className="my-8 space-y-4 text-sm">
          <div className="flex justify-between border-b border-on-primary/10 pb-3">
            <span>Billing Cycle</span>
            <span>Monthly</span>
          </div>
          <div className="flex justify-between border-b border-on-primary/10 pb-3">
            <span>Properties</span>
            <span>Up to 50</span>
          </div>
          <div className="flex justify-between">
            <span>Next Invoice</span>
            <span>Awaiting setup</span>
          </div>
        </div>
        <Link
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 text-sm font-semibold text-on-primary hover:bg-white/20"
          href="/pricing"
        >
          <ExternalLink size={14} />
          View Plans
        </Link>
      </div>
      <SectionCard title="Payment Method">
        <div className="mb-4 flex items-center justify-between rounded-lg border border-outline-variant/50 bg-surface p-4">
          <div className="flex items-center gap-4">
            <span className="flex h-9 w-12 items-center justify-center rounded border border-outline-variant/40 bg-white text-xs font-bold text-primary">PP</span>
            <div>
              <p className="font-semibold">PayPal billing</p>
              <p className="text-xs text-on-surface-variant">Setup required</p>
            </div>
          </div>
          <CreditCard className="text-secondary" size={20} />
        </div>
        <Link
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-outline-variant text-sm font-semibold hover:bg-surface-container-low"
          href="/pricing"
        >
          <ExternalLink size={14} />
          Configure Billing
        </Link>
      </SectionCard>
    </div>
  );
}
