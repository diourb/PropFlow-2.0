import type { Role } from "@/lib/types";

export function roleHomePath(role: Role, status?: string) {
  if (status === "suspended" || status === "disabled") return "/suspended";

  switch (role) {
    case "platform_admin":
      return "/admin";
    case "owner":
      return "/owner-dashboard";
    case "cleaner":
      return "/cleaner-dashboard";
    case "maintenance_tech":
      return "/maintenance-dashboard";
    case "guest":
      return "/guest";
    case "workspace_admin":
    case "manager":
    default:
      return "/dashboard";
  }
}

export function roleLabel(role: Role) {
  if (role === "manager") return "Manager / Host";
  return role.replace(/_/g, " ");
}
