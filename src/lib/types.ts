export type Role =
  | "platform_admin"
  | "workspace_admin"
  | "manager"
  | "owner"
  | "cleaner"
  | "maintenance_tech"
  | "guest";

export type RentalModel = "short_term" | "long_term" | "mixed";

export type PropertyStatus = "Occupied" | "Cleaning" | "Vacant" | "Maintenance";

export type BookingStatus =
  | "Confirmed"
  | "Checked-in"
  | "Checked-out"
  | "Pending"
  | "Cancelled";

export type WorkStatus =
  | "urgent"
  | "in_progress"
  | "awaiting_parts"
  | "completed"
  | "cancelled";

export type IntegrationStatus =
  | "connected"
  | "credential_required"
  | "syncing"
  | "disabled";

export type AppMode = "demo" | "supabase";

export type WorkflowStatus =
  | "pending"
  | "in_progress"
  | "awaiting_parts"
  | "completed"
  | "cancelled"
  | "submitted";

export interface Workspace {
  id: string;
  name: string;
  plan: "Starter" | "Professional" | "Enterprise";
  rentalModel: RentalModel;
  properties: number;
  status: "active" | "trial" | "past_due";
}

export interface AppSession {
  mode: AppMode;
  user: TeamMember;
  workspace: Workspace;
  role: Role;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "active" | "pending";
  avatar?: string;
}

export interface Property {
  id: string;
  name: string;
  location: string;
  address: string;
  owner: string;
  status: PropertyStatus;
  occupancy: number;
  revenueYtd: number;
  bedrooms: number;
  bathrooms: number;
  area: string;
  rating: number;
  image: string;
  model: RentalModel;
}

export interface Booking {
  id: string;
  guest: string;
  email: string;
  property: string;
  stayDates: string;
  nights: number;
  platform: "Airbnb" | "VRBO" | "Direct" | "Lease";
  payment: "Paid" | "Partial" | "Unpaid";
  status: BookingStatus;
  amount: number;
}

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "Active Booking" | "Past Guest" | "Upcoming" | "Tenant";
  stays: number;
  ltv: number;
  lastStay: string;
  flag?: string;
}

export interface OwnerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  properties: string[];
  status: "active" | "pending" | "inactive";
}

export interface CleaningTask {
  id: string;
  property: string;
  address: string;
  checkIn: string;
  type: string;
  status: "pending" | "in_progress" | "completed";
  completed: number;
  total: number;
  image: string;
}

export interface ChecklistItem {
  id: string;
  cleaningTaskId: string;
  room: string;
  label: string;
  completed: boolean;
  warning?: boolean;
  sortOrder: number;
}

export interface MaintenanceRequest {
  id: string;
  property: string;
  location: string;
  title: string;
  description: string;
  priority: "Critical" | "High Priority" | "Routine" | "Low";
  status: WorkStatus;
  reportedAgo: string;
  estimate: string;
  assignee: string;
}

export interface AttachmentMeta {
  id: string;
  entityType: "issue_report" | "maintenance_request" | "property" | "profile";
  entityId: string;
  name: string;
  mimeType: string;
  url?: string;
  path?: string;
}

export interface IssueReport {
  id: string;
  cleaningTaskId?: string;
  property: string;
  category: string;
  description: string;
  status: WorkflowStatus;
  reportedBy: string;
  createdAt: string;
  attachment?: AttachmentMeta;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  channel: "email" | "sms" | "push" | "in_app";
  read: boolean;
  createdAt: string;
}

export interface OwnerStatement {
  id: string;
  owner: string;
  properties: number;
  revenue: number;
  expenses: number;
  payout: number;
  status: "ready" | "draft" | "sent";
}

export interface Integration {
  id: string;
  name: string;
  provider: "airbnb" | "vrbo" | "google_calendar" | "quickbooks" | "paypal" | "twilio";
  status: IntegrationStatus;
  description: string;
  lastSync: string;
  lastSyncAt?: string;
  metadata?: Record<string, unknown>;
}

export interface OperationsSnapshot {
  session: AppSession;
  teamMembers: TeamMember[];
  owners: OwnerProfile[];
  properties: Property[];
  bookings: Booking[];
  guests: Guest[];
  cleaningTasks: CleaningTask[];
  checklistItems: ChecklistItem[];
  maintenanceRequests: MaintenanceRequest[];
  issueReports: IssueReport[];
  ownerStatements: OwnerStatement[];
  integrations: Integration[];
  notifications: NotificationItem[];
}

export interface RepositoryResult {
  ok: boolean;
  message: string;
  id?: string;
}
