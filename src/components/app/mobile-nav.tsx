"use client";

import Link from "next/link";
import Image from "next/image";
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
  Menu,
  Shield,
  SprayCan,
  Users,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import type { NavIconName } from "@/components/app/nav-links";

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

type MobileNavProps = {
  items: NavItem[];
  workspaceName: string;
  userAvatar: string;
  userName: string;
};

export function MobileNav({ items, workspaceName, userAvatar, userName }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  function close() {
    setOpen(false);
    document.body.style.overflow = "";
  }

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        aria-label="Open navigation menu"
        className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high md:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu size={22} />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-on-background/50"
            onClick={close}
          />
          <aside className="absolute left-0 top-0 flex h-full w-[280px] flex-col bg-primary-container py-6 shadow-xl">
            <div className="flex items-center justify-between px-6">
              <Link className="flex items-center gap-3" href="/dashboard">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-on-secondary">
                  <Building2 size={21} />
                </span>
                <span className="block font-heading text-xl font-bold text-on-primary">
                  {workspaceName}
                </span>
              </Link>
              <button
                aria-label="Close menu"
                className="flex h-8 w-8 items-center justify-center rounded-full text-on-primary/70 hover:bg-on-primary-fixed-variant/20"
                onClick={close}
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-4 flex items-center gap-3 border-b border-on-primary/10 px-6 pb-4">
              <Image
                alt={userName}
                className="h-10 w-10 rounded-full object-cover"
                height={40}
                src={userAvatar}
                style={{ height: 40, width: 40 }}
                width={40}
              />
              <span className="text-sm font-semibold text-on-primary">{userName}</span>
            </div>

            <nav className="flex-1 overflow-y-auto px-2 pt-4">
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
                    onClick={close}
                  >
                    <Icon size={20} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      ) : null}
    </>
  );
}
