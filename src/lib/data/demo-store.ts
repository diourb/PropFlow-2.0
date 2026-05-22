import {
  bookings as seededBookings,
  cleaningTasks as seededCleaningTasks,
  currentUser,
  guests as seededGuests,
  integrations,
  maintenanceRequests as seededMaintenanceRequests,
  ownerStatements,
  properties as seededProperties,
  teamMembers,
  workspace,
} from "@/lib/demo-data";
import type {
  AttachmentMeta,
  Booking,
  ChecklistItem,
  CleaningTask,
  Guest,
  IssueReport,
  MaintenanceRequest,
  NotificationItem,
  OwnerProfile,
  OperationsSnapshot,
  Property,
  RepositoryResult,
  Role,
} from "@/lib/types";

const initialChecklist: ChecklistItem[] = [
  {
    id: "kitchen-fridge",
    cleaningTaskId: "clean_001",
    room: "Kitchen",
    label: "Empty and clean refrigerator",
    completed: false,
    sortOrder: 1,
  },
  {
    id: "kitchen-counters",
    cleaningTaskId: "clean_001",
    room: "Kitchen",
    label: "Wipe down all countertops and sink",
    completed: false,
    sortOrder: 2,
  },
  {
    id: "kitchen-coffee",
    cleaningTaskId: "clean_001",
    room: "Kitchen",
    label: "Restock coffee supplies",
    completed: false,
    warning: true,
    sortOrder: 3,
  },
  {
    id: "bed-linens",
    cleaningTaskId: "clean_001",
    room: "Bedrooms",
    label: "Strip and replace all linens",
    completed: false,
    sortOrder: 4,
  },
  {
    id: "bed-items",
    cleaningTaskId: "clean_001",
    room: "Bedrooms",
    label: "Check under beds for left items",
    completed: false,
    sortOrder: 5,
  },
  {
    id: "bath-towels",
    cleaningTaskId: "clean_001",
    room: "Bathrooms",
    label: "Replace towels and toiletries",
    completed: false,
    sortOrder: 6,
  },
  {
    id: "living-linens",
    cleaningTaskId: "clean_001",
    room: "Living Area",
    label: "Replace living room linens",
    completed: false,
    sortOrder: 7,
  },
  {
    id: "final-photo",
    cleaningTaskId: "clean_001",
    room: "Final",
    label: "Upload final walkthrough photos",
    completed: false,
    sortOrder: 8,
  },
];

type DemoState = {
  role: Role;
  workspaceName?: string;
  properties: Property[];
  bookings: Booking[];
  guests: Guest[];
  owners: OwnerProfile[];
  cleaningTasks: CleaningTask[];
  checklistItems: ChecklistItem[];
  maintenanceRequests: MaintenanceRequest[];
  issueReports: IssueReport[];
  notifications: NotificationItem[];
};

const globalStore = globalThis as typeof globalThis & {
  __propflowDemoState?: DemoState;
};

function createInitialState(): DemoState {
  const ownerNames = [...new Set(seededProperties.map((property) => property.owner))];
  return {
    role: "workspace_admin",
    properties: [...seededProperties],
    bookings: [...seededBookings],
    guests: [...seededGuests],
    owners: ownerNames.map((name, index) => ({
      id: `owner_${index + 1}`,
      name,
      email: `${name.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/(^\.|\.$)/g, "")}@owner.example.com`,
      phone: "+1 (555) 010-0000",
      properties: seededProperties
        .filter((property) => property.owner === name)
        .map((property) => property.id),
      status: "active",
    })),
    cleaningTasks: [...seededCleaningTasks],
    checklistItems: [...initialChecklist],
    maintenanceRequests: [...seededMaintenanceRequests],
    issueReports: [],
    notifications: [
      {
        id: "notif_demo_1",
        title: "Demo workspace ready",
        body: "Core operations are running in hybrid demo mode.",
        channel: "in_app",
        read: false,
        createdAt: new Date().toISOString(),
      },
    ],
  };
}

function getState() {
  globalStore.__propflowDemoState ??= createInitialState();
  return globalStore.__propflowDemoState;
}

function makeId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function setDemoRole(role: Role): RepositoryResult {
  getState().role = role;
  return { ok: true, message: `Demo persona switched to ${role}.` };
}

export function getDemoSnapshot(role?: Role): OperationsSnapshot {
  const state = getState();
  const activeRole = role ?? state.role;
  const completed = state.checklistItems.filter((item) => item.completed).length;
  const cleaningTasks = state.cleaningTasks.map((task) =>
    task.id === "clean_001"
      ? { ...task, completed, total: state.checklistItems.length }
      : task,
  );
  const activeWorkspace = state.workspaceName
    ? { ...workspace, name: state.workspaceName }
    : workspace;

  return {
    session: {
      mode: "demo",
      role: activeRole,
      user: { ...currentUser, role: activeRole },
      workspace: activeWorkspace,
    },
    teamMembers,
    owners: state.owners,
    properties: state.properties,
    bookings: state.bookings,
    guests: state.guests,
    cleaningTasks,
    checklistItems: state.checklistItems,
    maintenanceRequests: state.maintenanceRequests,
    issueReports: state.issueReports,
    ownerStatements,
    integrations,
    notifications: state.notifications,
  };
}

export function createDemoWorkspace(name: string): RepositoryResult {
  getState().workspaceName = name;
  return { ok: true, id: workspace.id, message: "Demo workspace created." };
}

export function createDemoProperty(input: {
  name: string;
  address?: string;
  owner?: string;
  rentalModel?: Property["model"];
  status?: Property["status"];
}): RepositoryResult {
  const state = getState();
  const property: Property = {
    id: makeId("prop"),
    name: input.name,
    location: input.address?.split(",").slice(-2).join(",").trim() || "New Market",
    address: input.address || "Address pending",
    owner: input.owner || "Unassigned Owner",
    status: input.status ?? "Vacant",
    occupancy: input.status === "Occupied" ? 88 : 0,
    revenueYtd: 0,
    bedrooms: 2,
    bathrooms: 2,
    area: "Setup pending",
    rating: 0,
    model: input.rentalModel ?? "mixed",
    image:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
  };

  state.properties.unshift(property);
  state.notifications.unshift({
    id: makeId("notif"),
    title: "Property added",
    body: `${property.name} is ready for setup.`,
    channel: "in_app",
    read: false,
    createdAt: new Date().toISOString(),
  });

  return { ok: true, id: property.id, message: "Property added." };
}

export function createDemoBooking(input: {
  guestName: string;
  email?: string;
  property: string;
  platform?: Booking["platform"];
  amount?: number;
}): RepositoryResult {
  const state = getState();
  const booking: Booking = {
    id: makeId("bk"),
    guest: input.guestName,
    email: input.email || "guest@example.com",
    property: input.property,
    stayDates: "Next turnover",
    nights: input.platform === "Lease" ? 365 : 3,
    platform: input.platform ?? "Direct",
    payment: "Unpaid",
    status: "Confirmed",
    amount: input.amount ?? 0,
  };

  state.bookings.unshift(booking);

  if (booking.platform !== "Lease") {
    const task: CleaningTask = {
      id: makeId("clean"),
      property: booking.property,
      address: "Address inherited from property",
      checkIn: "3:00 PM",
      type: "Turnover - Auto Generated",
      status: "pending",
      completed: 0,
      total: initialChecklist.length,
      image:
        "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
    };
    state.cleaningTasks.unshift(task);
  }

  state.notifications.unshift({
    id: makeId("notif"),
    title: "Booking created",
    body: `${booking.guest} was added for ${booking.property}.`,
    channel: "in_app",
    read: false,
    createdAt: new Date().toISOString(),
  });

  return { ok: true, id: booking.id, message: "Booking created." };
}

export function inviteDemoMember(input: {
  email: string;
  role: Role;
}): RepositoryResult {
  const state = getState();
  state.notifications.unshift({
    id: makeId("notif"),
    title: "Invite created",
    body: `${input.email} was invited as ${input.role.replace("_", " ")}.`,
    channel: "in_app",
    read: false,
    createdAt: new Date().toISOString(),
  });

  return { ok: true, id: input.email, message: "Demo invite created." };
}

export function createDemoGuestMaintenanceRequest(input: {
  title: string;
  description: string;
  property?: string;
}): RepositoryResult {
  const state = getState();
  const request: MaintenanceRequest = {
    id: makeId("guest_req"),
    property: input.property || state.bookings[0]?.property || "Guest stay",
    location: "Guest portal",
    title: input.title,
    description: input.description,
    priority: "Routine",
    status: "urgent",
    reportedAgo: "Just now",
    estimate: "TBD",
    assignee: "Unassigned",
  };

  state.maintenanceRequests.unshift(request);
  state.notifications.unshift({
    id: makeId("notif"),
    title: "Guest maintenance request",
    body: `${request.title} was submitted for ${request.property}.`,
    channel: "in_app",
    read: false,
    createdAt: new Date().toISOString(),
  });

  return { ok: true, id: request.id, message: "Maintenance request submitted." };
}

export function saveDemoNotificationPreferences(channels: string[]): RepositoryResult {
  getState().notifications.unshift({
    id: makeId("notif"),
    title: "Notification preferences saved",
    body: `Enabled channels: ${channels.join(", ") || "none"}.`,
    channel: "in_app",
    read: false,
    createdAt: new Date().toISOString(),
  });

  return { ok: true, message: "Notification preferences saved." };
}

export function updateDemoChecklistItem(
  itemId: string,
  completed: boolean,
): RepositoryResult {
  const state = getState();
  state.checklistItems = state.checklistItems.map((item) =>
    item.id === itemId ? { ...item, completed } : item,
  );
  return { ok: true, id: itemId, message: "Checklist updated." };
}

export function submitDemoIssueReport(input: {
  cleaningTaskId?: string;
  category: string;
  description: string;
  attachment?: AttachmentMeta;
}): RepositoryResult {
  const state = getState();
  const task = state.cleaningTasks.find((item) => item.id === input.cleaningTaskId);
  const report: IssueReport = {
    id: makeId("issue"),
    cleaningTaskId: input.cleaningTaskId,
    property: task?.property ?? "Unassigned property",
    category: input.category,
    description: input.description,
    status: "submitted",
    reportedBy: currentUser.name,
    createdAt: new Date().toISOString(),
    attachment: input.attachment,
  };

  state.issueReports.unshift(report);
  state.maintenanceRequests.unshift({
    id: makeId("wo"),
    property: report.property,
    location: report.category,
    title: `${report.category} issue`,
    description: report.description,
    priority: report.category === "Damage" ? "High Priority" : "Routine",
    status: "urgent",
    reportedAgo: "Just now",
    estimate: "TBD",
    assignee: "Unassigned",
  });
  state.notifications.unshift({
    id: makeId("notif"),
    title: "Issue reported",
    body: `${report.category} issue submitted for ${report.property}.`,
    channel: "in_app",
    read: false,
    createdAt: new Date().toISOString(),
  });

  return { ok: true, id: report.id, message: "Issue reported." };
}

export function updateDemoWorkOrderStatus(
  id: string,
  status: MaintenanceRequest["status"],
): RepositoryResult {
  const state = getState();
  state.maintenanceRequests = state.maintenanceRequests.map((request) =>
    request.id === id ? { ...request, status, reportedAgo: "Updated now" } : request,
  );
  state.notifications.unshift({
    id: makeId("notif"),
    title: "Work order updated",
    body: `Work order ${id} moved to ${status.replace("_", " ")}.`,
    channel: "in_app",
    read: false,
    createdAt: new Date().toISOString(),
  });
  return { ok: true, id, message: "Work order updated." };
}

export function updateDemoWorkspaceSettings(updates: { name?: string; rentalModel?: string }): RepositoryResult {
  if (updates.name) getState().workspaceName = updates.name;
  return { ok: true, message: "Workspace settings updated." };
}

export function updateDemoProperty(
  id: string,
  updates: Partial<Pick<Property, "name" | "address" | "owner" | "status" | "model">>,
): RepositoryResult {
  const state = getState();
  const exists = state.properties.find((p) => p.id === id);
  if (!exists) return { ok: false, message: "Property not found." };
  state.properties = state.properties.map((p) =>
    p.id === id
      ? {
          ...p,
          ...updates,
          location: updates.address
            ? updates.address.split(",").slice(-2).join(",").trim()
            : p.location,
        }
      : p,
  );
  return { ok: true, id, message: "Property updated." };
}

export function deleteDemoProperty(id: string): RepositoryResult {
  const state = getState();
  const exists = state.properties.find((p) => p.id === id);
  if (!exists) return { ok: false, message: "Property not found." };
  state.properties = state.properties.filter((p) => p.id !== id);
  state.notifications.unshift({
    id: makeId("notif"),
    title: "Property removed",
    body: `${exists.name} was removed from the portfolio.`,
    channel: "in_app",
    read: false,
    createdAt: new Date().toISOString(),
  });
  return { ok: true, id, message: "Property deleted." };
}

export function updateDemoBooking(
  id: string,
  updates: Partial<Pick<Booking, "guest" | "email" | "property" | "platform" | "amount" | "status" | "payment">>,
): RepositoryResult {
  const state = getState();
  const exists = state.bookings.find((b) => b.id === id);
  if (!exists) return { ok: false, message: "Booking not found." };
  state.bookings = state.bookings.map((b) =>
    b.id === id ? { ...b, ...updates } : b,
  );
  return { ok: true, id, message: "Booking updated." };
}

export function deleteDemoBooking(id: string): RepositoryResult {
  const state = getState();
  const exists = state.bookings.find((b) => b.id === id);
  if (!exists) return { ok: false, message: "Booking not found." };
  state.bookings = state.bookings.filter((b) => b.id !== id);
  return { ok: true, id, message: "Booking deleted." };
}

export function createDemoGuest(input: {
  name: string;
  email: string;
  phone: string;
  flag?: string;
}): RepositoryResult {
  const state = getState();
  const guest: Guest = {
    id: makeId("guest"),
    name: input.name,
    email: input.email,
    phone: input.phone,
    status: "Past Guest",
    stays: 0,
    ltv: 0,
    lastStay: "No stays yet",
    flag: input.flag || undefined,
  };
  state.guests.unshift(guest);
  return { ok: true, id: guest.id, message: "Guest added." };
}

export function createDemoOwner(input: {
  name: string;
  email?: string;
  phone?: string;
  propertyIds?: string[];
}): RepositoryResult {
  const state = getState();
  const owner: OwnerProfile = {
    id: makeId("owner"),
    name: input.name,
    email: input.email || "owner@example.com",
    phone: input.phone || "",
    properties: input.propertyIds ?? [],
    status: "active",
  };
  state.owners.unshift(owner);
  state.properties = state.properties.map((property) =>
    owner.properties.includes(property.id)
      ? { ...property, owner: owner.name }
      : property,
  );
  state.notifications.unshift({
    id: makeId("notif"),
    title: "Owner added",
    body: `${owner.name} was added to owner management.`,
    channel: "in_app",
    read: false,
    createdAt: new Date().toISOString(),
  });
  return { ok: true, id: owner.id, message: "Owner added." };
}

export function updateDemoOwner(
  id: string,
  updates: Partial<Pick<OwnerProfile, "name" | "email" | "phone" | "status" | "properties">>,
): RepositoryResult {
  const state = getState();
  const owner = state.owners.find((item) => item.id === id);
  if (!owner) return { ok: false, message: "Owner not found." };
  const nextOwner = { ...owner, ...updates };
  state.owners = state.owners.map((item) => (item.id === id ? nextOwner : item));
  state.properties = state.properties.map((property) => {
    if (nextOwner.properties.includes(property.id)) {
      return { ...property, owner: nextOwner.name };
    }
    if (property.owner === owner.name && !nextOwner.properties.includes(property.id)) {
      return { ...property, owner: "Unassigned Owner" };
    }
    return property;
  });
  return { ok: true, id, message: "Owner updated." };
}

export function deleteDemoOwner(id: string): RepositoryResult {
  const state = getState();
  const owner = state.owners.find((item) => item.id === id);
  if (!owner) return { ok: false, message: "Owner not found." };
  state.owners = state.owners.filter((item) => item.id !== id);
  state.properties = state.properties.map((property) =>
    property.owner === owner.name ? { ...property, owner: "Unassigned Owner" } : property,
  );
  return { ok: true, id, message: "Owner removed." };
}

export function createDemoCleaningTask(input: {
  property: string;
  type?: string;
  checkIn?: string;
  address?: string;
}): RepositoryResult {
  const state = getState();
  const property = state.properties.find((item) => item.name === input.property);
  const task: CleaningTask = {
    id: makeId("clean"),
    property: input.property || "Unassigned Property",
    address: input.address || property?.address || "Address pending",
    checkIn: input.checkIn || "3:00 PM",
    type: input.type || "Turnover - Standard Reset",
    status: "pending",
    completed: 0,
    total: initialChecklist.length,
    image: property?.image || "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
  };
  state.cleaningTasks.unshift(task);
  state.checklistItems.push(
    ...initialChecklist.map((item, index) => ({
      ...item,
      id: `${task.id}_${index + 1}`,
      cleaningTaskId: task.id,
      completed: false,
    })),
  );
  return { ok: true, id: task.id, message: "Cleaning task added." };
}

export function createDemoMaintenanceRequest(input: {
  property: string;
  title: string;
  description?: string;
  priority?: MaintenanceRequest["priority"];
  assignee?: string;
  estimate?: string;
}): RepositoryResult {
  const request: MaintenanceRequest = {
    id: makeId("wo"),
    property: input.property || "Unassigned Property",
    location: "Operations",
    title: input.title,
    description: input.description || "No description provided.",
    priority: input.priority || "Routine",
    status: "urgent",
    reportedAgo: "Just now",
    estimate: input.estimate || "TBD",
    assignee: input.assignee || "Unassigned",
  };
  getState().maintenanceRequests.unshift(request);
  return { ok: true, id: request.id, message: "Work order added." };
}

export function updateDemoGuest(
  id: string,
  updates: Partial<Pick<Guest, "name" | "email" | "phone" | "flag" | "status">>,
): RepositoryResult {
  const state = getState();
  const exists = state.guests.find((g) => g.id === id);
  if (!exists) return { ok: false, message: "Guest not found." };
  state.guests = state.guests.map((g) =>
    g.id === id ? { ...g, ...updates } : g,
  );
  return { ok: true, id, message: "Guest updated." };
}

export function deleteDemoGuest(id: string): RepositoryResult {
  const state = getState();
  const exists = state.guests.find((g) => g.id === id);
  if (!exists) return { ok: false, message: "Guest not found." };
  state.guests = state.guests.filter((g) => g.id !== id);
  return { ok: true, id, message: "Guest removed." };
}

export function updateDemoCleaningTaskStatus(
  id: string,
  status: CleaningTask["status"],
): RepositoryResult {
  const state = getState();
  state.cleaningTasks = state.cleaningTasks.map((task) =>
    task.id === id ? { ...task, status } : task,
  );
  if (status === "completed") {
    state.notifications.unshift({
      id: makeId("notif"),
      title: "Cleaning task completed",
      body: `Task ${id} marked as guest ready.`,
      channel: "in_app",
      read: false,
      createdAt: new Date().toISOString(),
    });
  }
  return { ok: true, id, message: "Cleaning task updated." };
}

export function deleteDemoMaintenanceRequest(id: string): RepositoryResult {
  const state = getState();
  const exists = state.maintenanceRequests.find((r) => r.id === id);
  if (!exists) return { ok: false, message: "Work order not found." };
  state.maintenanceRequests = state.maintenanceRequests.filter((r) => r.id !== id);
  return { ok: true, id, message: "Work order deleted." };
}

export function updateDemoMaintenanceRequest(
  id: string,
  updates: Partial<Pick<MaintenanceRequest, "title" | "description" | "priority" | "assignee" | "estimate" | "status">>,
): RepositoryResult {
  const state = getState();
  const exists = state.maintenanceRequests.find((r) => r.id === id);
  if (!exists) return { ok: false, message: "Work order not found." };
  state.maintenanceRequests = state.maintenanceRequests.map((r) =>
    r.id === id ? { ...r, ...updates } : r,
  );
  return { ok: true, id, message: "Work order updated." };
}

export function markDemoNotificationRead(id: string): RepositoryResult {
  const state = getState();
  state.notifications = state.notifications.map((notification) =>
    notification.id === id ? { ...notification, read: true } : notification,
  );
  return { ok: true, id, message: "Notification marked read." };
}

export function markAllDemoNotificationsRead(): RepositoryResult {
  const state = getState();
  state.notifications = state.notifications.map((notification) => ({
    ...notification,
    read: true,
  }));
  return { ok: true, message: "Notifications marked read." };
}
