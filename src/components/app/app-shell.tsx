import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  LogOut,
  Plus,
  Settings,
  Sparkles,
  Settings2,
} from "lucide-react";
import { setDemoRoleAction, signOut } from "@/app/actions";
import { getOperationsSnapshot } from "@/lib/data/repository";
import { MobileNav } from "@/components/app/mobile-nav";
import { NavLinks } from "@/components/app/nav-links";
import { NotificationButton } from "@/components/app/notification-button";
import { SearchBar } from "@/components/app/search-bar";
import type { Role } from "@/lib/types";
import type { NavIconName } from "@/components/app/nav-links";

type ShellNavItem = {
  href: string;
  label: string;
  icon: NavIconName;
  roles: Role[];
};

const navItems: ShellNavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "home", roles: ["platform_admin", "workspace_admin", "manager"] },
  { href: "/properties", label: "Properties", icon: "building", roles: ["platform_admin", "workspace_admin", "manager"] },
  { href: "/bookings", label: "Bookings", icon: "calendar", roles: ["platform_admin", "workspace_admin", "manager"] },
  { href: "/calendar", label: "Calendar", icon: "calendar", roles: ["platform_admin", "workspace_admin", "manager", "owner", "cleaner", "maintenance_tech"] },
  { href: "/guests", label: "Guests", icon: "users", roles: ["platform_admin", "workspace_admin", "manager"] },
  { href: "/cleaning", label: "Cleaning", icon: "spray", roles: ["platform_admin", "workspace_admin", "manager"] },
  { href: "/maintenance", label: "Maintenance", icon: "hammer", roles: ["platform_admin", "workspace_admin", "manager"] },
  { href: "/owners", label: "Owners", icon: "clipboard", roles: ["platform_admin", "workspace_admin", "manager"] },
  { href: "/reports", label: "Reports", icon: "chart", roles: ["platform_admin", "workspace_admin", "manager", "owner"] },
  { href: "/notifications", label: "Notifications", icon: "bell", roles: ["platform_admin", "workspace_admin", "manager", "owner", "cleaner", "maintenance_tech", "guest"] },
  { href: "/owner", label: "Owner Portal", icon: "key", roles: ["platform_admin", "workspace_admin", "manager", "owner"] },
  { href: "/field/cleaning", label: "Cleaner Portal", icon: "spray", roles: ["platform_admin", "workspace_admin", "manager", "cleaner"] },
  { href: "/field/maintenance", label: "Tech Portal", icon: "hammer", roles: ["platform_admin", "workspace_admin", "manager", "maintenance_tech"] },
  { href: "/guest", label: "Guest Portal", icon: "users", roles: ["platform_admin", "workspace_admin", "manager", "guest"] },
  { href: "/admin", label: "Admin", icon: "shield", roles: ["platform_admin"] },
];

const demoRoles: Array<[Role, string]> = [
  ["platform_admin", "Platform"],
  ["workspace_admin", "Admin"],
  ["manager", "Manager / Host"],
  ["owner", "Owner"],
  ["cleaner", "Cleaner"],
  ["maintenance_tech", "Tech"],
  ["guest", "Guest"],
];

export async function AppShell({ children }: { children: React.ReactNode }) {
  const { session, notifications } = await getOperationsSnapshot();
  const avatar = session.user.avatar ?? "/icon.svg";
  const visibleNav = navItems.filter((item) => item.roles.includes(session.role));
  const canAddProperty = ["platform_admin", "workspace_admin", "manager"].includes(session.role);
  const canCreateReport = ["platform_admin", "workspace_admin", "manager", "owner"].includes(session.role);

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <aside className="fixed left-0 top-0 z-30 hidden h-full w-[280px] flex-col bg-primary-container py-6 text-on-primary shadow-lg md:flex">
        <div className="px-6">
          <Link className="flex items-center gap-3" href="/dashboard">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-on-secondary">
              <Building2 size={21} />
            </span>
            <span>
              <span className="block font-heading text-2xl font-bold leading-tight">
                PropFlow
              </span>
              <span className="text-xs font-medium text-on-primary/70">
                Management Portal
              </span>
            </span>
          </Link>
        </div>

        {canCreateReport ? (
          <div className="px-4 py-6">
            <Link
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-secondary text-sm font-semibold text-on-secondary transition hover:bg-secondary-fixed hover:text-on-secondary-fixed"
              href="/reports"
            >
              <Plus size={18} />
              New Report
            </Link>
          </div>
        ) : null}

        <nav className="flex-1 overflow-y-auto px-2">
          <NavLinks items={visibleNav} />
        </nav>

        <div className="mx-4 border-t border-on-primary/10 pt-4">
          <Link
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-on-primary/70 hover:bg-on-primary-fixed-variant/20 hover:text-on-primary"
            href="/settings/workspace"
          >
            <Settings2 size={20} />
            Workspace Settings
          </Link>
          <form action={signOut}>
            <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold text-on-primary/70 hover:bg-on-primary-fixed-variant/20 hover:text-on-primary">
              <LogOut size={20} />
              Log Out
            </button>
          </form>
        </div>
      </aside>

      <div className="min-h-screen md:ml-[280px]">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-outline-variant bg-surface px-4 shadow-sm md:px-6">
          <div className="flex items-center gap-3">
            <MobileNav
              items={visibleNav}
              workspaceName="PropFlow"
              userAvatar={avatar}
              userName={session.user.name}
            />
            <SearchBar />
            <div className="md:hidden">
              <span className="font-heading text-xl font-bold text-primary">
                PropFlow
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {canAddProperty ? (
              <Link
                className="hidden h-10 items-center gap-2 rounded-lg bg-primary-container px-4 text-sm font-semibold text-on-primary transition hover:bg-primary md:flex"
                href="/properties"
              >
                <Plus size={17} />
                Add Property
              </Link>
            ) : null}
            <NotificationButton notifications={notifications} />
            <Link
              className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high"
              href="/settings/account"
            >
              <Settings size={20} />
            </Link>
            <Link
              className="hidden items-center gap-3 rounded-full border border-outline-variant bg-surface-container-lowest py-1 pl-1 pr-3 md:flex"
              href="/settings/account"
            >
              <Image
                alt={session.user.name}
                className="h-8 w-8 rounded-full object-cover"
                height={32}
                src={avatar}
                style={{ height: 32, width: 32 }}
                width={32}
              />
              <span className="text-left">
                <span className="block text-xs font-semibold text-primary">
                  {session.user.name}
                </span>
                <span className="block text-[11px] text-on-surface-variant">
                  {session.workspace.plan} - {session.role.replace("_", " ")}
                </span>
              </span>
            </Link>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1440px] px-4 py-6 md:px-10 md:py-10">
          <div className="mb-5 flex flex-col gap-3 rounded-lg border border-secondary/20 bg-secondary/10 px-4 py-3 text-sm text-on-secondary-container md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={17} />
              {session.mode === "demo"
                ? "Hybrid demo mode is active. Switch personas or connect Supabase for live operations."
                : `${session.workspace.name} is running with Supabase-backed operations.`}
            </div>
            {session.mode === "demo" ? (
              <form action={setDemoRoleAction} className="flex flex-wrap items-center gap-2">
                <select
                  className="h-9 rounded-lg border border-secondary/30 bg-surface-container-lowest px-3 text-xs font-semibold text-primary"
                  defaultValue={session.role}
                  name="role"
                >
                  {demoRoles.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <button className="h-9 rounded-lg bg-secondary px-3 text-xs font-semibold text-on-secondary">
                  Switch
                </button>
              </form>
            ) : null}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
