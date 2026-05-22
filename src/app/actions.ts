"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { getServerSupabase } from "@/lib/supabase/server";
import type { Booking, MaintenanceRequest, Property, Role } from "@/lib/types";
import {
  createBookingRecord,
  createCleaningTaskRecord,
  createGuestMaintenanceRequestRecord,
  createGuestRecord,
  createMaintenanceRequestRecord,
  createOwnerRecord,
  createPropertyRecord,
  createWorkspaceRecord,
  deleteBookingRecord,
  deleteGuestRecord,
  deleteMaintenanceRequestRecord,
  deleteOwnerRecord,
  deletePropertyRecord,
  inviteMemberRecord,
  markAllNotificationsReadRecord,
  markNotificationReadRecord,
  saveNotificationPreferencesRecord,
  setDemoRole,
  submitIssueReportRecord,
  updateBookingRecord,
  updateChecklistItemRecord,
  updateCleaningTaskStatusRecord,
  updateGuestRecord,
  updateMaintenanceRequestRecord,
  updateOwnerRecord,
  updatePropertyRecord,
  updateWorkOrderStatusRecord,
  updateWorkspaceSettingsRecord,
} from "@/lib/data/repository";
import { roleHomePath } from "@/lib/routing";

type ActionResult = {
  ok: boolean;
  message: string;
  id?: string;
};

const workspaceSchema = z.object({
  name: z.string().min(2),
  rentalModel: z.enum(["short_term", "long_term", "mixed"]).default("mixed"),
});

const issueSchema = z.object({
  cleaningTaskId: z.string().optional(),
  category: z.string().min(1),
  description: z.string().min(1),
});

const maintenanceRequestSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(3),
  property: z.string().optional(),
});

const roleSchema = z.enum([
  "platform_admin",
  "workspace_admin",
  "manager",
  "owner",
  "cleaner",
  "maintenance_tech",
  "guest",
]);

export async function signInWithPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = roleSchema.safeParse(formData.get("role")).success
    ? (formData.get("role") as Role)
    : "workspace_admin";

  if (!hasSupabaseEnv()) {
    await setDemoRole(role);
    redirect(roleHomePath(role));
  }

  if (!email || !password) {
    redirect("/login?error=missing_credentials");
  }

  const supabase = await getServerSupabase();
  if (!supabase || !email || !password) {
    redirect("/login?error=missing_credentials");
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: membership } = user
    ? await supabase
        .from("memberships")
        .select("role, status")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle()
    : { data: null };
  redirect(roleHomePath((membership?.role as Role | undefined) ?? "workspace_admin", String(membership?.status ?? "")));
}

export async function signUpWithPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();

  if (!hasSupabaseEnv()) {
    await setDemoRole("workspace_admin");
    redirect("/workspace");
  }

  const supabase = await getServerSupabase();
  if (!supabase || !email || !password) {
    redirect("/login?error=missing_credentials");
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName || email } },
  });
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);
  redirect("/workspace");
}

export async function signInWithGoogle() {
  if (!hasSupabaseEnv()) {
    await setDemoRole("workspace_admin");
    redirect("/dashboard");
  }

  const supabase = await getServerSupabase();
  if (!supabase) redirect("/login?error=supabase_not_configured");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error || !data.url) {
    redirect(`/login?error=${encodeURIComponent(error?.message ?? "Google OAuth unavailable")}`);
  }
  redirect(data.url);
}

export async function signOut() {
  if (hasSupabaseEnv()) {
    const supabase = await getServerSupabase();
    await supabase?.auth.signOut();
  }
  redirect("/login");
}

export async function setDemoRoleAction(formData: FormData) {
  const parsed = roleSchema.safeParse(formData.get("role"));
  if (!parsed.success) return;
  await setDemoRole(parsed.data);
  revalidatePath("/", "layout");
}

export async function createWorkspace(formData: FormData): Promise<ActionResult> {
  const parsed = workspaceSchema.safeParse({
    name: formData.get("name"),
    rentalModel: formData.get("rentalModel") ?? "mixed",
  });

  if (!parsed.success) {
    return { ok: false, message: "Workspace name is required." };
  }

  const result = await createWorkspaceRecord({
    name: parsed.data.name,
    rentalModel: parsed.data.rentalModel,
  });

  revalidatePath("/workspace");
  revalidatePath("/dashboard");
  return result;
}

export async function joinWorkspace(formData: FormData): Promise<ActionResult> {
  const inviteCode = String(formData.get("inviteCode") ?? "").trim();
  if (!inviteCode) return { ok: false, message: "Invite code is required." };

  if (!hasSupabaseEnv()) {
    revalidatePath("/workspace");
    return { ok: true, id: inviteCode, message: "Invite accepted in demo mode." };
  }

  const supabase = await getServerSupabase();
  if (!supabase) return { ok: false, message: "Database not available." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "You must be signed in to join a workspace." };

  const { data: invite } = await supabase
    .from("invitations")
    .select("id, workspace_id, role, status")
    .eq("id", inviteCode)
    .eq("status", "pending")
    .maybeSingle();

  if (!invite) return { ok: false, message: "Invalid or expired invite code." };

  const { error: membershipError } = await supabase.from("memberships").insert({
    workspace_id: invite.workspace_id,
    user_id: user.id,
    email: user.email,
    role: invite.role ?? "manager",
    status: "active",
  });

  if (membershipError) return { ok: false, message: membershipError.message };

  await supabase.from("invitations").update({ status: "accepted" }).eq("id", invite.id);

  revalidatePath("/workspace");
  revalidatePath("/dashboard");
  return { ok: true, id: inviteCode, message: "You have joined the workspace." };
}

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!firstName) return { ok: false, message: "First name is required." };

  if (!hasSupabaseEnv()) {
    return { ok: true, message: "Profile updated in demo mode." };
  }

  const supabase = await getServerSupabase();
  if (!supabase) return { ok: false, message: "Database not available." };

  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  const { error } = await supabase.auth.updateUser({
    ...(email ? { email } : {}),
    data: { full_name: fullName },
  });

  if (error) return { ok: false, message: error.message };
  revalidatePath("/settings/account");
  return { ok: true, message: "Profile updated successfully." };
}

export async function inviteMember(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const role = roleSchema.safeParse(formData.get("role")).success
    ? (formData.get("role") as Role)
    : "manager";
  if (!email) return { ok: false, message: "Email is required." };

  const result = await inviteMemberRecord({ email, role });
  revalidatePath("/settings/workspace");
  revalidatePath("/dashboard");
  return result;
}

export async function createProperty(formData: FormData): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, message: "Property name is required." };

  const result = await createPropertyRecord({
    name,
    address: String(formData.get("address") ?? ""),
    owner: String(formData.get("owner") ?? ""),
    rentalModel: String(formData.get("rentalModel") ?? "mixed") as Property["model"],
    status: String(formData.get("status") ?? "Vacant") as Property["status"],
  });
  revalidatePath("/properties");
  revalidatePath("/dashboard");
  return result;
}

export async function createBooking(formData: FormData): Promise<ActionResult> {
  const guestName = String(formData.get("guestName") ?? "").trim();
  if (!guestName) return { ok: false, message: "Guest name is required." };

  const result = await createBookingRecord({
    guestName,
    email: String(formData.get("email") ?? ""),
    property: String(formData.get("property") ?? "Unassigned Property"),
    platform: String(formData.get("platform") ?? "Direct") as Booking["platform"],
    amount: Number(formData.get("amount") ?? 0),
  });
  revalidatePath("/bookings");
  revalidatePath("/cleaning");
  revalidatePath("/field/cleaning");
  revalidatePath("/dashboard");
  return result;
}

export async function updateCleaningChecklistItem(formData: FormData): Promise<ActionResult> {
  const itemId = String(formData.get("itemId") ?? "");
  const completed = formData.get("completed") === "true";

  if (!itemId) return { ok: false, message: "Checklist item is required." };

  const result = await updateChecklistItemRecord(itemId, completed);
  revalidatePath("/cleaning");
  revalidatePath("/field/cleaning");
  return result;
}

export async function submitIssueReport(formData: FormData): Promise<ActionResult> {
  const parsed = issueSchema.safeParse({
    cleaningTaskId: formData.get("cleaningTaskId") || undefined,
    category: formData.get("category"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Category and description are required." };
  }

  const photo = formData.get("photo");
  let attachment:
    | {
        id: string;
        entityType: "issue_report";
        entityId: string;
        name: string;
        mimeType: string;
        url?: string;
        path?: string;
      }
    | undefined;

  if (photo instanceof File && photo.size > 0) {
    const fileName = `${Date.now()}-${photo.name}`;
    const uploadPath = `issues/${fileName}`;
    attachment = {
      id: fileName,
      entityType: "issue_report",
      entityId: "pending",
      name: photo.name,
      mimeType: photo.type || "application/octet-stream",
      path: uploadPath,
    };

    if (hasSupabaseEnv()) {
      const supabase = await getServerSupabase();
      const { error } =
        (await supabase?.storage
          .from("attachments")
          .upload(uploadPath, photo, { upsert: false })) ?? {};
      if (error) return { ok: false, message: error.message };
    }
  }

  const result = await submitIssueReportRecord({
    cleaningTaskId: parsed.data.cleaningTaskId,
    category: parsed.data.category,
    description: parsed.data.description,
    attachment,
  });

  revalidatePath("/cleaning");
  revalidatePath("/field/cleaning");
  revalidatePath("/maintenance");
  revalidatePath("/field/maintenance");
  revalidatePath("/dashboard");
  return result;
}

export async function updateWorkOrderStatus(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as MaintenanceRequest["status"];

  if (!id || !status) return { ok: false, message: "Work order and status are required." };

  const result = await updateWorkOrderStatusRecord(id, status);
  revalidatePath("/maintenance");
  revalidatePath("/field/maintenance");
  revalidatePath("/dashboard");
  return result;
}

export async function createGuestMaintenanceRequest(formData: FormData): Promise<ActionResult> {
  const parsed = maintenanceRequestSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    property: formData.get("property") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, message: "Title and description are required." };
  }

  const result = await createGuestMaintenanceRequestRecord(parsed.data);
  revalidatePath("/guest");
  revalidatePath("/maintenance");
  revalidatePath("/field/maintenance");
  revalidatePath("/dashboard");
  return result;
}

export async function saveNotificationPreferences(formData: FormData): Promise<ActionResult> {
  const channels = ["email", "sms", "push", "in_app"].filter(
    (channel) => formData.get(channel) === "on",
  );

  const result = await saveNotificationPreferencesRecord(channels);
  revalidatePath("/settings/account");
  return result;
}

export async function updateProperty(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!id) return { ok: false, message: "Property ID is required." };
  if (!name) return { ok: false, message: "Property name is required." };
  const result = await updatePropertyRecord(id, {
    name,
    address: String(formData.get("address") ?? ""),
    owner: String(formData.get("owner") ?? ""),
    model: String(formData.get("rentalModel") ?? "mixed") as Property["model"],
    status: String(formData.get("status") ?? "Vacant") as Property["status"],
  });
  revalidatePath("/properties");
  revalidatePath("/dashboard");
  return result;
}

export async function deleteProperty(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { ok: false, message: "Property ID is required." };
  const result = await deletePropertyRecord(id);
  revalidatePath("/properties");
  revalidatePath("/dashboard");
  return result;
}

export async function updateBooking(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "").trim();
  const guestName = String(formData.get("guestName") ?? "").trim();
  if (!id) return { ok: false, message: "Booking ID is required." };
  if (!guestName) return { ok: false, message: "Guest name is required." };
  const result = await updateBookingRecord(id, {
    guest: guestName,
    email: String(formData.get("email") ?? ""),
    property: String(formData.get("property") ?? ""),
    platform: String(formData.get("platform") ?? "Direct") as Booking["platform"],
    amount: Number(formData.get("amount") ?? 0),
    status: String(formData.get("status") ?? "Confirmed") as Booking["status"],
    payment: String(formData.get("payment") ?? "Unpaid") as Booking["payment"],
  });
  revalidatePath("/bookings");
  revalidatePath("/dashboard");
  return result;
}

export async function deleteBooking(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { ok: false, message: "Booking ID is required." };
  const result = await deleteBookingRecord(id);
  revalidatePath("/bookings");
  revalidatePath("/dashboard");
  return result;
}

export async function createGuest(formData: FormData): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  if (!name) return { ok: false, message: "Guest name is required." };
  if (!email) return { ok: false, message: "Email is required." };
  const result = await createGuestRecord({ name, email, phone, flag: String(formData.get("flag") ?? "").trim() || undefined });
  revalidatePath("/guests");
  return result;
}

export async function createOwner(formData: FormData): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, message: "Owner name is required." };
  const propertyIds = formData.getAll("propertyIds").map(String).filter(Boolean);
  const result = await createOwnerRecord({
    name,
    email: String(formData.get("email") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    propertyIds,
  });
  revalidatePath("/owners");
  revalidatePath("/properties");
  revalidatePath("/reports");
  return result;
}

export async function updateOwner(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!id) return { ok: false, message: "Owner ID is required." };
  if (!name) return { ok: false, message: "Owner name is required." };
  const statusValue = String(formData.get("status") ?? "active");
  const status = ["active", "pending", "inactive"].includes(statusValue)
    ? (statusValue as "active" | "pending" | "inactive")
    : "active";
  const result = await updateOwnerRecord(id, {
    name,
    email: String(formData.get("email") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    status,
    propertyIds: formData.getAll("propertyIds").map(String).filter(Boolean),
  });
  revalidatePath("/owners");
  revalidatePath("/properties");
  revalidatePath("/reports");
  return result;
}

export async function deleteOwner(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { ok: false, message: "Owner ID is required." };
  const result = await deleteOwnerRecord(id);
  revalidatePath("/owners");
  revalidatePath("/properties");
  return result;
}

export async function createCleaningTask(formData: FormData): Promise<ActionResult> {
  const property = String(formData.get("property") ?? "").trim();
  if (!property) return { ok: false, message: "Property is required." };
  const result = await createCleaningTaskRecord({
    property,
    type: String(formData.get("type") ?? "").trim(),
    checkIn: String(formData.get("checkIn") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
  });
  revalidatePath("/cleaning");
  revalidatePath("/field/cleaning");
  revalidatePath("/calendar");
  return result;
}

export async function createMaintenanceRequest(formData: FormData): Promise<ActionResult> {
  const property = String(formData.get("property") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { ok: false, message: "Title is required." };
  const result = await createMaintenanceRequestRecord({
    property,
    title,
    description: String(formData.get("description") ?? "").trim(),
    priority: String(formData.get("priority") ?? "Routine") as MaintenanceRequest["priority"],
    assignee: String(formData.get("assignee") ?? "").trim(),
    estimate: String(formData.get("estimate") ?? "").trim(),
  });
  revalidatePath("/maintenance");
  revalidatePath("/field/maintenance");
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return result;
}

export async function updateGuest(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!id) return { ok: false, message: "Guest ID is required." };
  if (!name) return { ok: false, message: "Name is required." };
  const result = await updateGuestRecord(id, {
    name,
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    flag: String(formData.get("flag") ?? "").trim() || undefined,
  });
  revalidatePath("/guests");
  return result;
}

export async function deleteGuest(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { ok: false, message: "Guest ID is required." };
  const result = await deleteGuestRecord(id);
  revalidatePath("/guests");
  return result;
}

export async function updateCleaningStatus(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "") as "pending" | "in_progress" | "completed";
  if (!id || !status) return { ok: false, message: "ID and status are required." };
  const result = await updateCleaningTaskStatusRecord(id, status);
  revalidatePath("/cleaning");
  revalidatePath("/field/cleaning");
  revalidatePath("/dashboard");
  return result;
}

export async function deleteMaintenanceRequest(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { ok: false, message: "Work order ID is required." };
  const result = await deleteMaintenanceRequestRecord(id);
  revalidatePath("/maintenance");
  revalidatePath("/field/maintenance");
  revalidatePath("/dashboard");
  return result;
}

export async function updateWorkspaceSettings(formData: FormData): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, message: "Workspace name is required." };
  const result = await updateWorkspaceSettingsRecord({
    name,
    rentalModel: String(formData.get("rentalModel") ?? ""),
  });
  revalidatePath("/settings/workspace");
  revalidatePath("/dashboard");
  return result;
}

export async function updateMaintenanceRequest(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  if (!id) return { ok: false, message: "Work order ID is required." };
  if (!title) return { ok: false, message: "Title is required." };
  const result = await updateMaintenanceRequestRecord(id, {
    title,
    description: String(formData.get("description") ?? ""),
    priority: String(formData.get("priority") ?? "Routine") as MaintenanceRequest["priority"],
    assignee: String(formData.get("assignee") ?? ""),
    estimate: String(formData.get("estimate") ?? ""),
  });
  revalidatePath("/maintenance");
  revalidatePath("/field/maintenance");
  return result;
}

export async function markNotificationRead(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { ok: false, message: "Notification ID is required." };
  const result = await markNotificationReadRecord(id);
  revalidatePath("/notifications");
  revalidatePath("/", "layout");
  return result;
}

export async function markAllNotificationsRead(): Promise<ActionResult> {
  const result = await markAllNotificationsReadRecord();
  revalidatePath("/notifications");
  revalidatePath("/", "layout");
  return result;
}
