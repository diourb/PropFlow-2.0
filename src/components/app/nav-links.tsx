"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  ClipboardList,
  Hammer,
  Home,
  KeyRound,
  Shield,
  SprayCan,
  Users,
} from "lucide-react";

export type NavIconName =
  | "bell"
  | "building"
  | "calendar"
  | "chart"
  | "clipboard"
  | "hammer"
  | "home"
  | "key"
  | "shield"
  | "spray"
  | "users";

const navIcons = {
  bell: Bell,
  building: Building2,
  calendar: CalendarDays,
  chart: BarChart3,
  clipboard: ClipboardList,
  hammer: Hammer,
  home: Home,
  key: KeyRound,
  shield: Shield,
  spray: SprayCan,
  users: Users,
} satisfies Record<NavIconName, typeof Home>;

type NavItem = {
  href: string;
  label: string;
  icon: NavIconName;
};

export function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <>
      {items.map((item) => {
        const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        const Icon = navIcons[item.icon];
        return (
          <Link
            className={`flex items-center gap-3 rounded-r-lg border-l-4 px-4 py-3 text-sm font-semibold transition hover:bg-on-primary-fixed-variant/20 hover:text-on-primary ${
              active
                ? "border-secondary bg-on-primary-fixed-variant/20 text-on-primary"
                : "border-transparent text-on-primary/70"
            }`}
            href={item.href}
            key={item.href}
          >
            <Icon size={20} />
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
