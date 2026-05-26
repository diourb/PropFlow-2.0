"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
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
  Search,
  Shield,
  SprayCan,
  Users,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import type { NavIconName } from "@/components/app/nav-links";
import type { SearchItem } from "@/components/app/search-bar";

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
  searchItems: SearchItem[];
  workspaceName: string;
  userAvatar: string;
  userName: string;
};

export function MobileNav({ items, searchItems, workspaceName, userAvatar, userName }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const q = query.trim().toLowerCase();
  const searchMatches = (q
    ? searchItems.filter((item) =>
        [item.title, item.subtitle, item.category].join(" ").toLowerCase().includes(q),
      )
    : searchItems
  ).slice(0, 5);

  function close() {
    setOpen(false);
    setQuery("");
  }

  function goTo(href: string) {
    router.push(href);
    close();
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
                title="Close menu"
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

            <form
              className="mx-4 mt-4 rounded-xl border border-white/10 bg-white/10 p-3"
              onSubmit={(event) => {
                event.preventDefault();
                const fallbackHref = q ? `/properties?q=${encodeURIComponent(query.trim())}` : "/dashboard";
                goTo(searchMatches[0]?.href ?? fallbackHref);
              }}
            >
              <label className="flex h-10 items-center gap-2 rounded-lg bg-white/10 px-3 text-on-primary">
                <Search size={17} className="text-on-primary/70" />
                <input
                  className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-on-primary/50"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search workspace"
                  value={query}
                />
              </label>
              {query ? (
                <div className="mt-2 space-y-1">
                  {searchMatches.length === 0 ? (
                    <button
                      className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-on-primary/70 hover:bg-white/10"
                      type="submit"
                    >
                      Search properties for &quot;{query.trim()}&quot;
                    </button>
                  ) : (
                    searchMatches.map((item) => (
                      <Link
                        className="block w-full rounded-lg px-3 py-2 text-left hover:bg-white/10"
                        href={item.href}
                        key={`${item.category}-${item.href}-${item.title}`}
                        onClick={close}
                        role="button"
                      >
                        <span className="block truncate text-sm font-semibold text-on-primary">
                          {item.title}
                        </span>
                        <span className="block truncate text-xs text-on-primary/60">
                          {item.category} - {item.subtitle}
                        </span>
                      </Link>
                    ))
                  )}
                </div>
              ) : null}
            </form>

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
