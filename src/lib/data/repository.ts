import { cookies } from "next/headers";
import type {
  AttachmentMeta,
  Booking,
  ChecklistItem,
  CleaningTask,
  Guest,
  Integration,
  IssueReport,
  MaintenanceRequest,
  OperationsSnapshot,
  OwnerStatement,
  Property,
  RepositoryResult,
  Role,
  TeamMember,
  Workspace,
} from "@/lib/types";
import { getServerSupabase } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import {
  createDemoBooking,
  createDemoCleaningTask,
  createDemoGuestMaintenanceRequest,
  createDemoGuest,
  createDemoMaintenanceRequest,
  createDemoOwner,
  createDemoProperty,
  createDemoWorkspace,
  deleteDemoBooking,
  deleteDemoGuest,
  deleteDemoMaintenanceRequest,
  deleteDemoOwner,
  deleteDemoProperty,
  getDemoSnapshot,
  inviteDemoMember,
  markAllDemoNotificationsRead,
  markDemoNotificationRead,
  saveDemoNotificationPreferences,
  setDemoRole as setDemoStoreRole,
  submitDemoIssueReport,
  updateDemoBooking,
  updateDemoChecklistItem,
  updateDemoCleaningTaskStatus,
  updateDemoGuest,
  updateDemoMaintenanceRequest,
  updateDemoOwner,
  updateDemoProperty,
  updateDemoWorkOrderStatus,
  updateDemoWorkspaceSettings,
} from "./demo-store";

const demoRoleCookie = "propflow_demo_role";

function asRole(value: unknown): Role {
  const role = String(value ?? "workspace_admin");
  if (
    [
      "platform_admin",
      "workspace_admin",
      "manager",
      "owner",
      "cleaner",
      "maintenance_tech",
      "guest",
    ].includes(role)
  ) {
    return role as Role;
  }
  return "workspace_admin";
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function numberValue(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function moneyFromCents(value: unknown) {
  return Math.round(numberValue(value) / 100);
}

const defaultChecklistItems = [
  ["Kitchen", "Empty and clean refrigerator"],
  ["Kitchen", "Wipe down all countertops and sink"],
  ["Kitchen", "Restock coffee supplies"],
  ["Bedrooms", "Strip and replace all linens"],
  ["Bedrooms", "Check under beds for left items"],
  ["Bathrooms", "Replace towels and toiletries"],
  ["Living Area", "Replace living room linens"],
  ["Final", "Upload final walkthrough photos"],
] as const;

async function getDemoRole() {
  const cookieStore = await cookies();
  return asRole(cookieStore.get(demoRoleCookie)?.value);
}

export async function setDemoRole(role: Role): Promise<RepositoryResult> {
  const cookieStore = await cookies();
  cookieStore.set(demoRoleCookie, role, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  return setDemoStoreRole(role);
}

export async function getOperationsSnapshot(): Promise<OperationsSnapshot> {
  if (!hasSupabaseEnv()) return getDemoSnapshot(await getDemoRole());

  const supabase = await getServerSupabase();
  if (!supabase) return getDemoSnapshot(await getDemoRole());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return getDemoSnapshot(await getDemoRole());

  const { data: membership } = await supabase
    .from("memberships")
    .select("role, workspace_id, workspaces(id,name,rental_model,plan_slug,status)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  const workspaceRow = Array.isArray(membership?.workspaces)
    ? membership?.workspaces[0]
    : membership?.workspaces;
  const workspaceId = text(membership?.workspace_id);
  const role = asRole(membership?.role);

  if (!workspaceId) return getDemoSnapshot(role);

  const [
    propertiesResponse,
    bookingsResponse,
    guestsResponse,
    cleaningTasksResponse,
    checklistResponse,
    maintenanceResponse,
    ownersResponse,
    statementsResponse,
    integrationsResponse,
    notificationsResponse,
    membersResponse,
    issueReportsResponse,
    attachmentsResponse,
  ] = await Promise.all([
    supabase.from("properties").select("*").eq("workspace_id", workspaceId),
    supabase.from("bookings").select("*").eq("workspace_id", workspaceId),
    supabase.from("guests").select("*").eq("workspace_id", workspaceId),
    supabase.from("cleaning_tasks").select("*").eq("workspace_id", workspaceId),
    supabase.from("checklist_items").select("*").eq("workspace_id", workspaceId),
    supabase
      .from("maintenance_requests")
      .select("*")
      .eq("workspace_id", workspaceId),
    supabase.from("owners").select("*").eq("workspace_id", workspaceId),
    supabase.from("owner_statements").select("*").eq("workspace_id", workspaceId),
    supabase.from("integrations").select("*").eq("workspace_id", workspaceId),
    supabase.from("notifications").select("*").eq("workspace_id", workspaceId),
    supabase.from("memberships").select("*").eq("workspace_id", workspaceId),
    supabase.from("issue_reports").select("*").eq("workspace_id", workspaceId),
    supabase.from("attachments").select("*").eq("workspace_id", workspaceId),
  ]);

  const ownerById = new Map(
    (ownersResponse.data ?? []).map((owner) => [text(owner.id), text(owner.name)]),
  );
  const propertyById = new Map(
    (propertiesResponse.data ?? []).map((property) => [
      text(property.id),
      text(property.name, "Property"),
    ]),
  );
  const guestById = new Map(
    (guestsResponse.data ?? []).map((guest) => [
      text(guest.id),
      {
        name: text(guest.name, "Guest"),
        email: text(guest.email, "guest@example.com"),
      },
    ]),
  );
  const cleaningPropertyByTaskId = new Map(
    (cleaningTasksResponse.data ?? []).map((task) => [
      text(task.id),
      text(task.property_id),
    ]),
  );

  const workspace: Workspace = {
    id: workspaceId,
    name: text(workspaceRow?.name, "PropFlow Workspace"),
    plan:
      text(workspaceRow?.plan_slug, "professional") === "enterprise"
        ? "Enterprise"
        : text(workspaceRow?.plan_slug, "professional") === "starter"
          ? "Starter"
          : "Professional",
    rentalModel:
      text(workspaceRow?.rental_model, "mixed") === "short_term"
        ? "short_term"
        : text(workspaceRow?.rental_model, "mixed") === "long_term"
          ? "long_term"
          : "mixed",
    properties: propertiesResponse.data?.length ?? 0,
    status:
      text(workspaceRow?.status, "active") === "past_due"
        ? "past_due"
        : text(workspaceRow?.status, "active") === "trial"
          ? "trial"
          : "active",
  };

  const properties: Property[] = (propertiesResponse.data ?? []).map((property) => ({
    id: text(property.id),
    name: text(property.name, "Unnamed Property"),
    location: [property.city, property.region].filter(Boolean).join(", ") || "Location pending",
    address: text(property.address, "Address pending"),
    owner: ownerById.get(text(property.owner_id)) ?? "Unassigned Owner",
    status:
      text(property.status) === "maintenance"
        ? "Maintenance"
        : text(property.status) === "vacant"
          ? "Vacant"
          : text(property.status) === "cleaning"
            ? "Cleaning"
            : "Occupied",
    occupancy: 0,
    revenueYtd: 0,
    bedrooms: numberValue(property.bedrooms, 0),
    bathrooms: numberValue(property.bathrooms, 0),
    area: text(property.area, "Setup pending"),
    rating: 0,
    image: text(
      property.image_url,
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
    ),
    model:
      text(property.rental_model, "mixed") === "short_term"
        ? "short_term"
        : text(property.rental_model, "mixed") === "long_term"
          ? "long_term"
          : "mixed",
  }));

  const bookings: Booking[] = (bookingsResponse.data ?? []).map((booking) => {
    const guest = guestById.get(text(booking.guest_id));

    return {
      id: text(booking.id),
      guest: text(booking.guest_name, guest?.name ?? "Guest"),
      email: guest?.email ?? "guest@example.com",
      property: propertyById.get(text(booking.property_id)) ?? "Unassigned Property",
      stayDates:
        [booking.check_in, booking.check_out].filter(Boolean).join(" - ") ||
        "Dates pending",
      nights: 0,
      platform:
        text(booking.platform, "direct") === "airbnb"
          ? "Airbnb"
          : text(booking.platform, "direct") === "vrbo"
            ? "VRBO"
            : text(booking.platform, "direct") === "lease"
              ? "Lease"
              : "Direct",
      payment:
        text(booking.payment_status) === "paid"
          ? "Paid"
          : text(booking.payment_status) === "partial"
            ? "Partial"
            : "Unpaid",
      status:
        text(booking.status) === "checked_in"
          ? "Checked-in"
          : text(booking.status) === "checked_out"
            ? "Checked-out"
            : text(booking.status) === "pending"
              ? "Pending"
              : text(booking.status) === "cancelled"
                ? "Cancelled"
                : "Confirmed",
      amount: moneyFromCents(booking.amount_cents),
    };
  });

  const guests: Guest[] = (guestsResponse.data ?? []).map((guest) => ({
    id: text(guest.id),
    name: text(guest.name, "Guest"),
    email: text(guest.email, "guest@example.com"),
    phone: text(guest.phone, "No phone"),
    status: "Past Guest",
    stays: 0,
    ltv: 0,
    lastStay: "Live profile",
  }));

  const taskProgress = new Map<string, { completed: number; total: number }>();
  for (const item of checklistResponse.data ?? []) {
    const taskId = text(item.cleaning_task_id);
    const current = taskProgress.get(taskId) ?? { completed: 0, total: 0 };
    taskProgress.set(taskId, {
      completed: current.completed + (item.completed ? 1 : 0),
      total: current.total + 1,
    });
  }

  const cleaningTasks: CleaningTask[] = (cleaningTasksResponse.data ?? []).map((task) => {
    const progress = taskProgress.get(text(task.id)) ?? { completed: 0, total: 0 };
    return {
      id: text(task.id),
      property: propertyById.get(text(task.property_id)) ?? text(task.title, "Cleaning task"),
      address: "Address pending",
      checkIn: "3:00 PM",
      type: text(task.title, "Turnover"),
      status:
        text(task.status) === "completed"
          ? "completed"
          : text(task.status) === "in_progress"
            ? "in_progress"
            : "pending",
      completed: progress.completed,
      total: progress.total,
      image:
        "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
    };
  });

  const checklistItems: ChecklistItem[] = (checklistResponse.data ?? []).map((item) => ({
    id: text(item.id),
    cleaningTaskId: text(item.cleaning_task_id),
    room: text(item.room, "General"),
    label: text(item.label, "Checklist item"),
    completed: Boolean(item.completed),
    sortOrder: numberValue(item.sort_order),
  }));

  const maintenanceRequests: MaintenanceRequest[] = (maintenanceResponse.data ?? []).map(
    (request) => ({
      id: text(request.id),
      property: propertyById.get(text(request.property_id)) ?? "Unassigned Property",
      location: "Live request",
      title: text(request.title, "Maintenance request"),
      description: text(request.description, "No description"),
      priority:
        text(request.priority) === "critical"
          ? "Critical"
          : text(request.priority) === "high"
            ? "High Priority"
            : "Routine",
      status:
        text(request.status) === "completed"
          ? "completed"
          : text(request.status) === "awaiting_parts"
            ? "awaiting_parts"
            : text(request.status) === "in_progress"
              ? "in_progress"
              : "urgent",
      reportedAgo: "Live",
      estimate: "TBD",
      assignee: "Unassigned",
    }),
  );

  const ownerStatements: OwnerStatement[] = (statementsResponse.data ?? []).map(
    (statement) => ({
      id: text(statement.id),
      owner: ownerById.get(text(statement.owner_id)) ?? "Owner",
      properties: 0,
      revenue: moneyFromCents(statement.revenue_cents),
      expenses: moneyFromCents(statement.expenses_cents),
      payout: moneyFromCents(statement.payout_cents),
      status: text(statement.status) === "sent" ? "sent" : text(statement.status) === "ready" ? "ready" : "draft",
    }),
  );

  const teamMembers: TeamMember[] = (membersResponse.data ?? []).map((member) => ({
    id: text(member.user_id ?? member.id),
    name: text(member.email, "Workspace member"),
    email: text(member.email, "member@example.com"),
    role: asRole(member.role),
    status: text(member.status) === "pending" ? "pending" : "active",
  }));

  const liveIntegrations: Integration[] = (integrationsResponse.data ?? []).map((integration) => ({
    id: text(integration.id),
    provider: text(integration.provider, "paypal") as Integration["provider"],
    name: text(integration.provider, "Integration").replace("_", " "),
    status:
      text(integration.status) === "connected"
        ? "connected"
        : text(integration.status) === "syncing"
          ? "syncing"
          : text(integration.status) === "disabled"
            ? "disabled"
            : "credential_required",
    description: "Credential-gated live integration.",
    lastSync: "Live workspace",
  }));

  const attachmentEntries = await Promise.all(
    (attachmentsResponse.data ?? [])
      .filter((attachment) => text(attachment.entity_type) === "issue_report")
      .map(async (attachment) => {
        let url: string | undefined;
        const path = text(attachment.path);
        const bucket = text(attachment.bucket, "attachments");
        if (path) {
          const { data } = await supabase.storage
            .from(bucket)
            .createSignedUrl(path, 60 * 60);
          url = data?.signedUrl;
        }

        return [
          text(attachment.entity_id),
          {
            id: text(attachment.id),
            entityType: "issue_report" as const,
            entityId: text(attachment.entity_id),
            name: path.split("/").at(-1) ?? "Attachment",
            mimeType: text(attachment.mime_type, "application/octet-stream"),
            path,
            url,
          },
        ] as const;
      }),
  );
  const attachmentByIssueId = new Map(attachmentEntries);

  const issueReports: IssueReport[] = (issueReportsResponse.data ?? []).map((report) => {
    const taskPropertyId = cleaningPropertyByTaskId.get(text(report.cleaning_task_id));
    const propertyId = text(report.property_id) || taskPropertyId;

    return {
      id: text(report.id),
      cleaningTaskId: text(report.cleaning_task_id) || undefined,
      property: propertyById.get(propertyId ?? "") ?? "Unassigned Property",
      category: text(report.category, "Maintenance"),
      description: text(report.description),
      status: text(report.status, "submitted") as IssueReport["status"],
      reportedBy: "Workspace user",
      createdAt: text(report.created_at, new Date().toISOString()),
      attachment: attachmentByIssueId.get(text(report.id)),
    };
  });

  return {
    session: {
      mode: "supabase",
      role,
      user: {
        id: user.id,
        name: text(user.user_metadata?.full_name, user.email ?? "PropFlow User"),
        email: user.email ?? "user@example.com",
        role,
        status: "active",
      },
      workspace,
    },
    teamMembers,
    owners: (ownersResponse.data ?? []).map((owner) => ({
      id: text(owner.id),
      name: text(owner.name, "Owner"),
      email: text(owner.email, ""),
      phone: text(owner.phone, ""),
      properties: (propertiesResponse.data ?? [])
        .filter((property) => text(property.owner_id) === text(owner.id))
        .map((property) => text(property.id)),
      status:
        text(owner.status) === "pending"
          ? "pending"
          : text(owner.status) === "disabled" || text(owner.status) === "archived"
            ? "inactive"
            : "active",
    })),
    properties,
    bookings,
    guests,
    cleaningTasks,
    checklistItems,
    maintenanceRequests,
    issueReports,
    ownerStatements,
    integrations: liveIntegrations,
    notifications: (notificationsResponse.data ?? []).map((notification) => ({
      id: text(notification.id),
      title: text(notification.title, "Notification"),
      body: text(notification.body),
      channel: text(notification.channel, "in_app") as "email" | "sms" | "push" | "in_app",
      read: Boolean(notification.read_at),
      createdAt: text(notification.created_at, new Date().toISOString()),
    })),
  };
}

export async function createWorkspaceRecord(input: {
  name: string;
  rentalModel: string;
}): Promise<RepositoryResult> {
  if (!hasSupabaseEnv()) return createDemoWorkspace(input.name);
  const supabase = await getServerSupabase();
  if (!supabase) return createDemoWorkspace(input.name);

  const { data, error } = await supabase
    .from("workspaces")
    .insert({
      name: input.name,
      rental_model: input.rentalModel,
      plan_slug: "professional",
      status: "active",
    })
    .select("id")
    .single();

  if (error) return { ok: false, message: error.message };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user && data?.id) {
    await supabase.from("memberships").insert({
      workspace_id: data.id,
      user_id: user.id,
      email: user.email,
      role: "workspace_admin",
      status: "active",
    });
  }
  return { ok: true, id: data?.id, message: "Workspace created." };
}

async function getWorkspaceIdForMutation(): Promise<string | null> {
  const snapshot = await getOperationsSnapshot();
  const id = snapshot.session.workspace.id;
  return id === "ws_demo" ? null : id;
}

export async function createPropertyRecord(input: {
  name: string;
  address?: string;
  owner?: string;
  rentalModel?: Property["model"];
  status?: Property["status"];
}): Promise<RepositoryResult> {
  if (!hasSupabaseEnv()) return createDemoProperty(input);
  const supabase = await getServerSupabase();
  if (!supabase) return createDemoProperty(input);
  const workspaceId = await getWorkspaceIdForMutation();
  if (!workspaceId) return { ok: false, message: "No workspace found. Create or join a workspace first." };

  let ownerId: string | null = null;
  const ownerName = input.owner?.trim();
  if (ownerName) {
    const { data: existingOwner } = await supabase
      .from("owners")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("name", ownerName)
      .maybeSingle();

    if (existingOwner?.id) {
      ownerId = existingOwner.id;
    } else {
      const { data: createdOwner } = await supabase
        .from("owners")
        .insert({ workspace_id: workspaceId, name: ownerName })
        .select("id")
        .single();
      ownerId = createdOwner?.id ?? null;
    }
  }

  const { data, error } = await supabase
    .from("properties")
    .insert({
      workspace_id: workspaceId,
      owner_id: ownerId,
      name: input.name,
      address: input.address,
      rental_model: input.rentalModel ?? "mixed",
      status: input.status?.toLowerCase() ?? "vacant",
    })
    .select("id")
    .single();

  if (error) return { ok: false, message: error.message };
  await supabase.from("notifications").insert({
    workspace_id: workspaceId,
    channel: "in_app",
    title: "Property added",
    body: `${input.name} is ready for setup.`,
  });
  return { ok: true, id: data?.id, message: "Property added." };
}

export async function createBookingRecord(input: {
  guestName: string;
  email?: string;
  property: string;
  platform?: Booking["platform"];
  amount?: number;
}): Promise<RepositoryResult> {
  if (!hasSupabaseEnv()) return createDemoBooking(input);
  const supabase = await getServerSupabase();
  if (!supabase) return createDemoBooking(input);
  const workspaceId = await getWorkspaceIdForMutation();
  if (!workspaceId) return { ok: false, message: "No workspace found. Create or join a workspace first." };

  const { data: property } = await supabase
    .from("properties")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("name", input.property)
    .maybeSingle();

  let guestId: string | null = null;
  if (input.email) {
    const { data: existingGuest } = await supabase
      .from("guests")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("email", input.email)
      .maybeSingle();

    if (existingGuest?.id) {
      guestId = existingGuest.id;
    }
  }

  if (!guestId) {
    const { data: createdGuest } = await supabase
      .from("guests")
      .insert({
        workspace_id: workspaceId,
        name: input.guestName,
        email: input.email,
      })
      .select("id")
      .single();
    guestId = createdGuest?.id ?? null;
  }

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      workspace_id: workspaceId,
      property_id: property?.id,
      guest_id: guestId,
      guest_name: input.guestName,
      platform: input.platform?.toLowerCase() ?? "direct",
      status: "confirmed",
      payment_status: "unpaid",
      amount_cents: Math.round((input.amount ?? 0) * 100),
    })
    .select("id")
    .single();

  if (error) return { ok: false, message: error.message };

  if (input.platform !== "Lease") {
    const { data: task } = await supabase
      .from("cleaning_tasks")
      .insert({
        workspace_id: workspaceId,
        property_id: property?.id,
        booking_id: data?.id,
        title: `Turnover for ${input.property}`,
        status: "pending",
      })
      .select("id")
      .single();

    if (task?.id) {
      await supabase.from("checklist_items").insert(
        defaultChecklistItems.map(([room, label], index) => ({
          workspace_id: workspaceId,
          cleaning_task_id: task.id,
          room,
          label,
          sort_order: index + 1,
        })),
      );
    }
  }

  await supabase.from("financial_transactions").insert({
    workspace_id: workspaceId,
    property_id: property?.id,
    booking_id: data?.id,
    type: input.platform === "Lease" ? "rent" : "booking_revenue",
    amount_cents: Math.round((input.amount ?? 0) * 100),
    memo: `${input.platform ?? "Direct"} booking for ${input.guestName}`,
  });

  await supabase.from("notifications").insert({
    workspace_id: workspaceId,
    channel: "in_app",
    title: "Booking created",
    body: `${input.guestName} was added for ${input.property}.`,
  });

  return { ok: true, id: data?.id, message: "Booking created." };
}

export async function updateChecklistItemRecord(
  itemId: string,
  completed: boolean,
): Promise<RepositoryResult> {
  if (!hasSupabaseEnv()) return updateDemoChecklistItem(itemId, completed);
  const supabase = await getServerSupabase();
  if (!supabase) return updateDemoChecklistItem(itemId, completed);
  const workspaceId = await getWorkspaceIdForMutation();
  if (!workspaceId) return { ok: false, message: "No workspace found." };

  const { error } = await supabase
    .from("checklist_items")
    .update({ completed, completed_at: completed ? new Date().toISOString() : null })
    .eq("id", itemId)
    .eq("workspace_id", workspaceId);

  if (error) return { ok: false, message: error.message };
  return { ok: true, id: itemId, message: "Checklist updated." };
}

export async function submitIssueReportRecord(input: {
  cleaningTaskId?: string;
  category: string;
  description: string;
  attachment?: AttachmentMeta;
}): Promise<RepositoryResult> {
  if (!hasSupabaseEnv()) return submitDemoIssueReport(input);
  const supabase = await getServerSupabase();
  if (!supabase) return submitDemoIssueReport(input);
  const workspaceId = await getWorkspaceIdForMutation();
  if (!workspaceId) return { ok: false, message: "No workspace found. Create or join a workspace first." };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: task } = input.cleaningTaskId
    ? await supabase
        .from("cleaning_tasks")
        .select("property_id")
        .eq("id", input.cleaningTaskId)
        .eq("workspace_id", workspaceId)
        .maybeSingle()
    : { data: null };

  const { data, error } = await supabase
    .from("issue_reports")
    .insert({
      workspace_id: workspaceId,
      property_id: task?.property_id,
      cleaning_task_id: input.cleaningTaskId,
      reported_by: user?.id,
      category: input.category,
      description: input.description,
      status: "submitted",
    })
    .select("id")
    .single();

  if (error) return { ok: false, message: error.message };

  if (input.attachment && data?.id) {
    await supabase.from("attachments").insert({
      workspace_id: workspaceId,
      entity_type: "issue_report",
      entity_id: data.id,
      bucket: "attachments",
      path: input.attachment.path ?? input.attachment.name,
      mime_type: input.attachment.mimeType,
    });
  }

  await supabase.from("maintenance_requests").insert({
    workspace_id: workspaceId,
    property_id: task?.property_id,
    issue_report_id: data?.id,
    requested_by: user?.id,
    title: `${input.category} issue`,
    description: input.description,
    priority: input.category === "Damage" ? "high" : "routine",
    status: "pending",
  });

  await supabase.from("notifications").insert({
    workspace_id: workspaceId,
    channel: "in_app",
    title: "Issue reported",
    body: `${input.category} issue submitted.`,
  });

  return { ok: true, id: data?.id, message: "Issue reported." };
}

export async function updateWorkOrderStatusRecord(
  id: string,
  status: MaintenanceRequest["status"],
): Promise<RepositoryResult> {
  if (!hasSupabaseEnv()) return updateDemoWorkOrderStatus(id, status);
  const supabase = await getServerSupabase();
  if (!supabase) return updateDemoWorkOrderStatus(id, status);
  const workspaceId = await getWorkspaceIdForMutation();
  if (!workspaceId) return { ok: false, message: "No workspace found." };

  // "urgent" is stored as "pending" in DB; the read mapper converts "pending" back to "urgent"
  const dbStatus = status === "urgent" ? "pending" : status;
  const { error } = await supabase
    .from("maintenance_requests")
    .update({ status: dbStatus })
    .eq("id", id)
    .eq("workspace_id", workspaceId);

  if (error) return { ok: false, message: error.message };
  await supabase.from("notifications").insert({
    workspace_id: workspaceId,
    channel: "in_app",
    title: "Work order updated",
    body: `Work order moved to ${status.replace("_", " ")}.`,
  });
  return { ok: true, id, message: "Work order updated." };
}

export async function inviteMemberRecord(input: {
  email: string;
  role: Role;
}): Promise<RepositoryResult> {
  if (!hasSupabaseEnv()) return inviteDemoMember(input);
  const supabase = await getServerSupabase();
  if (!supabase) return inviteDemoMember(input);
  const workspaceId = await getWorkspaceIdForMutation();
  if (!workspaceId) return { ok: false, message: "No workspace found. Create or join a workspace first." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("invitations")
    .insert({
      workspace_id: workspaceId,
      email: input.email,
      role: input.role,
      created_by: user?.id,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) return { ok: false, message: error.message };
  await supabase.from("notifications").insert({
    workspace_id: workspaceId,
    channel: "in_app",
    title: "Invite created",
    body: `${input.email} was invited as ${input.role.replace("_", " ")}.`,
  });
  return { ok: true, id: data?.id, message: "Invite created." };
}

export async function createGuestMaintenanceRequestRecord(input: {
  title: string;
  description: string;
  property?: string;
}): Promise<RepositoryResult> {
  if (!hasSupabaseEnv()) return createDemoGuestMaintenanceRequest(input);
  const supabase = await getServerSupabase();
  if (!supabase) return createDemoGuestMaintenanceRequest(input);
  const workspaceId = await getWorkspaceIdForMutation();
  if (!workspaceId) return { ok: false, message: "No workspace found. Create or join a workspace first." };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: property } = input.property
    ? await supabase
        .from("properties")
        .select("id")
        .eq("workspace_id", workspaceId)
        .eq("name", input.property)
        .maybeSingle()
    : { data: null };

  const { data, error } = await supabase
    .from("maintenance_requests")
    .insert({
      workspace_id: workspaceId,
      property_id: property?.id,
      requested_by: user?.id,
      title: input.title,
      description: input.description,
      priority: "routine",
      status: "pending",
    })
    .select("id")
    .single();

  if (error) return { ok: false, message: error.message };
  await supabase.from("notifications").insert({
    workspace_id: workspaceId,
    channel: "in_app",
    title: "Guest maintenance request",
    body: `${input.title} was submitted${input.property ? ` for ${input.property}` : ""}.`,
  });

  return { ok: true, id: data?.id, message: "Maintenance request submitted." };
}

export async function updateWorkspaceSettingsRecord(updates: {
  name?: string;
  rentalModel?: string;
}): Promise<RepositoryResult> {
  if (!hasSupabaseEnv()) return updateDemoWorkspaceSettings(updates);
  const supabase = await getServerSupabase();
  if (!supabase) return updateDemoWorkspaceSettings(updates);
  const workspaceId = await getWorkspaceIdForMutation();
  if (!workspaceId) return { ok: false, message: "No workspace found." };
  const { error } = await supabase
    .from("workspaces")
    .update({ name: updates.name, rental_model: updates.rentalModel })
    .eq("id", workspaceId);
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Workspace settings updated." };
}

export async function updatePropertyRecord(
  id: string,
  updates: Partial<Pick<Property, "name" | "address" | "owner" | "status" | "model">>,
): Promise<RepositoryResult> {
  if (!hasSupabaseEnv()) return updateDemoProperty(id, updates);
  const supabase = await getServerSupabase();
  if (!supabase) return updateDemoProperty(id, updates);
  const workspaceId = await getWorkspaceIdForMutation();
  if (!workspaceId) return { ok: false, message: "No workspace found." };
  const { error } = await supabase
    .from("properties")
    .update({ name: updates.name, address: updates.address, status: updates.status?.toLowerCase(), rental_model: updates.model })
    .eq("id", id)
    .eq("workspace_id", workspaceId);
  if (error) return { ok: false, message: error.message };
  return { ok: true, id, message: "Property updated." };
}

export async function deletePropertyRecord(id: string): Promise<RepositoryResult> {
  if (!hasSupabaseEnv()) return deleteDemoProperty(id);
  const supabase = await getServerSupabase();
  if (!supabase) return deleteDemoProperty(id);
  const workspaceId = await getWorkspaceIdForMutation();
  if (!workspaceId) return { ok: false, message: "No workspace found." };
  const { error } = await supabase
    .from("properties")
    .delete()
    .eq("id", id)
    .eq("workspace_id", workspaceId);
  if (error) return { ok: false, message: error.message };
  return { ok: true, id, message: "Property deleted." };
}

export async function updateBookingRecord(
  id: string,
  updates: Partial<Pick<Booking, "guest" | "email" | "property" | "platform" | "amount" | "status" | "payment">>,
): Promise<RepositoryResult> {
  if (!hasSupabaseEnv()) return updateDemoBooking(id, updates);
  const supabase = await getServerSupabase();
  if (!supabase) return updateDemoBooking(id, updates);
  const workspaceId = await getWorkspaceIdForMutation();
  if (!workspaceId) return { ok: false, message: "No workspace found." };
  const { error } = await supabase
    .from("bookings")
    .update({ status: updates.status?.toLowerCase().replace("-", "_"), payment_status: updates.payment?.toLowerCase() })
    .eq("id", id)
    .eq("workspace_id", workspaceId);
  if (error) return { ok: false, message: error.message };
  return { ok: true, id, message: "Booking updated." };
}

export async function deleteBookingRecord(id: string): Promise<RepositoryResult> {
  if (!hasSupabaseEnv()) return deleteDemoBooking(id);
  const supabase = await getServerSupabase();
  if (!supabase) return deleteDemoBooking(id);
  const workspaceId = await getWorkspaceIdForMutation();
  if (!workspaceId) return { ok: false, message: "No workspace found." };
  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", id)
    .eq("workspace_id", workspaceId);
  if (error) return { ok: false, message: error.message };
  return { ok: true, id, message: "Booking deleted." };
}

export async function createGuestRecord(input: {
  name: string;
  email: string;
  phone: string;
  flag?: string;
}): Promise<RepositoryResult> {
  if (!hasSupabaseEnv()) return createDemoGuest(input);
  const supabase = await getServerSupabase();
  if (!supabase) return createDemoGuest(input);
  const workspaceId = await getWorkspaceIdForMutation();
  if (!workspaceId) return { ok: false, message: "No workspace found." };
  const { data, error } = await supabase
    .from("guests")
    .insert({ workspace_id: workspaceId, name: input.name, email: input.email, phone: input.phone })
    .select("id").single();
  if (error) return { ok: false, message: error.message };
  return { ok: true, id: data?.id, message: "Guest added." };
}

export async function updateGuestRecord(
  id: string,
  updates: Partial<Pick<Guest, "name" | "email" | "phone" | "flag">>,
): Promise<RepositoryResult> {
  if (!hasSupabaseEnv()) return updateDemoGuest(id, updates);
  const supabase = await getServerSupabase();
  if (!supabase) return updateDemoGuest(id, updates);
  const workspaceId = await getWorkspaceIdForMutation();
  if (!workspaceId) return { ok: false, message: "No workspace found." };
  const { error } = await supabase
    .from("guests")
    .update({ name: updates.name, email: updates.email, phone: updates.phone })
    .eq("id", id)
    .eq("workspace_id", workspaceId);
  if (error) return { ok: false, message: error.message };
  return { ok: true, id, message: "Guest updated." };
}

export async function deleteGuestRecord(id: string): Promise<RepositoryResult> {
  if (!hasSupabaseEnv()) return deleteDemoGuest(id);
  const supabase = await getServerSupabase();
  if (!supabase) return deleteDemoGuest(id);
  const workspaceId = await getWorkspaceIdForMutation();
  if (!workspaceId) return { ok: false, message: "No workspace found." };
  const { error } = await supabase
    .from("guests")
    .delete()
    .eq("id", id)
    .eq("workspace_id", workspaceId);
  if (error) return { ok: false, message: error.message };
  return { ok: true, id, message: "Guest removed." };
}

export async function createOwnerRecord(input: {
  name: string;
  email?: string;
  phone?: string;
  propertyIds?: string[];
}): Promise<RepositoryResult> {
  if (!hasSupabaseEnv()) return createDemoOwner(input);
  const supabase = await getServerSupabase();
  if (!supabase) return createDemoOwner(input);
  const workspaceId = await getWorkspaceIdForMutation();
  if (!workspaceId) return { ok: false, message: "No workspace found." };
  const { data, error } = await supabase
    .from("owners")
    .insert({
      workspace_id: workspaceId,
      name: input.name,
      email: input.email,
      phone: input.phone,
      status: "active",
    })
    .select("id")
    .single();
  if (error) return { ok: false, message: error.message };
  if (data?.id && input.propertyIds?.length) {
    await supabase
      .from("properties")
      .update({ owner_id: data.id })
      .eq("workspace_id", workspaceId)
      .in("id", input.propertyIds);
  }
  return { ok: true, id: data?.id, message: "Owner added." };
}

export async function updateOwnerRecord(
  id: string,
  updates: {
    name?: string;
    email?: string;
    phone?: string;
    status?: "active" | "pending" | "inactive";
    propertyIds?: string[];
  },
): Promise<RepositoryResult> {
  if (!hasSupabaseEnv()) {
    return updateDemoOwner(id, {
      name: updates.name,
      email: updates.email,
      phone: updates.phone,
      status: updates.status,
      properties: updates.propertyIds,
    });
  }
  const supabase = await getServerSupabase();
  if (!supabase) {
    return updateDemoOwner(id, {
      name: updates.name,
      email: updates.email,
      phone: updates.phone,
      status: updates.status,
      properties: updates.propertyIds,
    });
  }
  const workspaceId = await getWorkspaceIdForMutation();
  if (!workspaceId) return { ok: false, message: "No workspace found." };
  const dbStatus =
    updates.status === "inactive"
      ? "disabled"
      : updates.status === "pending"
        ? "pending"
        : "active";
  const { error } = await supabase
    .from("owners")
    .update({
      name: updates.name,
      email: updates.email,
      phone: updates.phone,
      status: dbStatus,
    })
    .eq("id", id)
    .eq("workspace_id", workspaceId);
  if (error) return { ok: false, message: error.message };
  if (updates.propertyIds) {
    await supabase
      .from("properties")
      .update({ owner_id: null })
      .eq("workspace_id", workspaceId)
      .eq("owner_id", id);
    if (updates.propertyIds.length) {
      await supabase
        .from("properties")
        .update({ owner_id: id })
        .eq("workspace_id", workspaceId)
        .in("id", updates.propertyIds);
    }
  }
  return { ok: true, id, message: "Owner updated." };
}

export async function deleteOwnerRecord(id: string): Promise<RepositoryResult> {
  if (!hasSupabaseEnv()) return deleteDemoOwner(id);
  const supabase = await getServerSupabase();
  if (!supabase) return deleteDemoOwner(id);
  const workspaceId = await getWorkspaceIdForMutation();
  if (!workspaceId) return { ok: false, message: "No workspace found." };
  await supabase
    .from("properties")
    .update({ owner_id: null })
    .eq("workspace_id", workspaceId)
    .eq("owner_id", id);
  const { error } = await supabase
    .from("owners")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("id", id);
  if (error) return { ok: false, message: error.message };
  return { ok: true, id, message: "Owner removed." };
}

export async function createCleaningTaskRecord(input: {
  property: string;
  type?: string;
  checkIn?: string;
  address?: string;
}): Promise<RepositoryResult> {
  if (!hasSupabaseEnv()) return createDemoCleaningTask(input);
  const supabase = await getServerSupabase();
  if (!supabase) return createDemoCleaningTask(input);
  const workspaceId = await getWorkspaceIdForMutation();
  if (!workspaceId) return { ok: false, message: "No workspace found." };
  const { data: property } = await supabase
    .from("properties")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("name", input.property)
    .maybeSingle();
  const { data, error } = await supabase
    .from("cleaning_tasks")
    .insert({
      workspace_id: workspaceId,
      property_id: property?.id,
      title: input.type || "Turnover - Standard Reset",
      status: "pending",
    })
    .select("id")
    .single();
  if (error) return { ok: false, message: error.message };
  if (data?.id) {
    await supabase.from("checklist_items").insert(
      defaultChecklistItems.map(([room, label], index) => ({
        workspace_id: workspaceId,
        cleaning_task_id: data.id,
        room,
        label,
        sort_order: index + 1,
      })),
    );
  }
  return { ok: true, id: data?.id, message: "Cleaning task added." };
}

export async function createMaintenanceRequestRecord(input: {
  property: string;
  title: string;
  description?: string;
  priority?: MaintenanceRequest["priority"];
  assignee?: string;
  estimate?: string;
}): Promise<RepositoryResult> {
  if (!hasSupabaseEnv()) return createDemoMaintenanceRequest(input);
  const supabase = await getServerSupabase();
  if (!supabase) return createDemoMaintenanceRequest(input);
  const workspaceId = await getWorkspaceIdForMutation();
  if (!workspaceId) return { ok: false, message: "No workspace found." };
  const { data: property } = await supabase
    .from("properties")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("name", input.property)
    .maybeSingle();
  const priority =
    input.priority === "Critical"
      ? "critical"
      : input.priority === "High Priority"
        ? "high"
        : input.priority === "Low"
          ? "low"
          : "routine";
  const { data, error } = await supabase
    .from("maintenance_requests")
    .insert({
      workspace_id: workspaceId,
      property_id: property?.id,
      title: input.title,
      description: input.description,
      priority,
      status: "pending",
    })
    .select("id")
    .single();
  if (error) return { ok: false, message: error.message };
  return { ok: true, id: data?.id, message: "Work order added." };
}

export async function updateCleaningTaskStatusRecord(
  id: string,
  status: "pending" | "in_progress" | "completed",
): Promise<RepositoryResult> {
  if (!hasSupabaseEnv()) return updateDemoCleaningTaskStatus(id, status);
  const supabase = await getServerSupabase();
  if (!supabase) return updateDemoCleaningTaskStatus(id, status);
  const workspaceId = await getWorkspaceIdForMutation();
  if (!workspaceId) return { ok: false, message: "No workspace found." };
  const { error } = await supabase
    .from("cleaning_tasks")
    .update({ status })
    .eq("id", id)
    .eq("workspace_id", workspaceId);
  if (error) return { ok: false, message: error.message };
  return { ok: true, id, message: "Cleaning task updated." };
}

export async function deleteMaintenanceRequestRecord(id: string): Promise<RepositoryResult> {
  if (!hasSupabaseEnv()) return deleteDemoMaintenanceRequest(id);
  const supabase = await getServerSupabase();
  if (!supabase) return deleteDemoMaintenanceRequest(id);
  const workspaceId = await getWorkspaceIdForMutation();
  if (!workspaceId) return { ok: false, message: "No workspace found." };
  const { error } = await supabase
    .from("maintenance_requests")
    .delete()
    .eq("id", id)
    .eq("workspace_id", workspaceId);
  if (error) return { ok: false, message: error.message };
  return { ok: true, id, message: "Work order deleted." };
}

export async function updateMaintenanceRequestRecord(
  id: string,
  updates: Partial<Pick<MaintenanceRequest, "title" | "description" | "priority" | "assignee" | "estimate" | "status">>,
): Promise<RepositoryResult> {
  if (!hasSupabaseEnv()) return updateDemoMaintenanceRequest(id, updates);
  const supabase = await getServerSupabase();
  if (!supabase) return updateDemoMaintenanceRequest(id, updates);
  const workspaceId = await getWorkspaceIdForMutation();
  if (!workspaceId) return { ok: false, message: "No workspace found." };
  const priority =
    updates.priority === "Critical"
      ? "critical"
      : updates.priority === "High Priority"
        ? "high"
        : updates.priority === "Low"
          ? "low"
          : updates.priority === "Routine"
            ? "routine"
            : undefined;
  const { error } = await supabase
    .from("maintenance_requests")
    .update({ title: updates.title, description: updates.description, priority, status: updates.status })
    .eq("id", id)
    .eq("workspace_id", workspaceId);
  if (error) return { ok: false, message: error.message };
  return { ok: true, id, message: "Work order updated." };
}

export async function markNotificationReadRecord(id: string): Promise<RepositoryResult> {
  if (!hasSupabaseEnv()) return markDemoNotificationRead(id);
  const supabase = await getServerSupabase();
  if (!supabase) return markDemoNotificationRead(id);
  const workspaceId = await getWorkspaceIdForMutation();
  if (!workspaceId) return { ok: false, message: "No workspace found." };
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("workspace_id", workspaceId);
  if (error) return { ok: false, message: error.message };
  return { ok: true, id, message: "Notification marked read." };
}

export async function markAllNotificationsReadRecord(): Promise<RepositoryResult> {
  if (!hasSupabaseEnv()) return markAllDemoNotificationsRead();
  const supabase = await getServerSupabase();
  if (!supabase) return markAllDemoNotificationsRead();
  const workspaceId = await getWorkspaceIdForMutation();
  if (!workspaceId) return { ok: false, message: "No workspace found." };
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("workspace_id", workspaceId)
    .is("read_at", null);
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Notifications marked read." };
}

export async function saveNotificationPreferencesRecord(
  channels: string[],
): Promise<RepositoryResult> {
  if (!hasSupabaseEnv()) return saveDemoNotificationPreferences(channels);
  const supabase = await getServerSupabase();
  if (!supabase) return saveDemoNotificationPreferences(channels);
  const workspaceId = await getWorkspaceIdForMutation();
  if (!workspaceId) return { ok: false, message: "No workspace found. Create or join a workspace first." };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "You must be signed in to save preferences." };

  const rows = (["email", "sms", "push", "in_app"] as const).map((channel) => ({
    workspace_id: workspaceId,
    user_id: user.id,
    channel,
    enabled: channels.includes(channel),
    updated_at: new Date().toISOString(),
  }));
  const { error } = await supabase
    .from("notification_preferences")
    .upsert(rows, { onConflict: "workspace_id,user_id,channel" });

  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Notification preferences saved." };
}
