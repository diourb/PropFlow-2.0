"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";

export type SearchItem = {
  title: string;
  subtitle: string;
  href: string;
  category: string;
};

export function SearchBar({ items }: { items: SearchItem[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, 6);
    return items
      .filter((item) =>
        [item.title, item.subtitle, item.category]
          .join(" ")
          .toLowerCase()
          .includes(q),
      )
      .slice(0, 8);
  }, [items, query]);

  function clearSearch() {
    setQuery("");
    setOpen(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function goTo(href: string) {
    router.push(href);
    clearSearch();
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const q = query.trim();
    if (!q) return;
    goTo(matches[0]?.href ?? `/properties?q=${encodeURIComponent(q)}`);
  }

  return (
    <form
      className="relative hidden h-10 w-[420px] items-center gap-2 rounded-full bg-surface-container-low px-4 ring-1 ring-outline-variant/60 focus-within:ring-secondary md:flex"
      onSubmit={handleSubmit}
    >
      <Search size={18} className="text-outline" />
      <input
        className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-outline"
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            clearSearch();
          }
          if (event.key === "Enter") {
            const q = query.trim();
            if (!q) return;
            event.preventDefault();
            goTo(matches[0]?.href ?? `/properties?q=${encodeURIComponent(q)}`);
          }
        }}
        placeholder="Search properties, guests, reports..."
        ref={inputRef}
        value={query}
      />

      {open ? (
        <div className="absolute left-0 top-12 z-50 w-full overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-lg">
          {matches.length === 0 ? (
            <div className="p-4 text-sm text-on-surface-variant">
              Press Enter to search properties for &quot;{query}&quot;.
            </div>
          ) : (
            <div className="max-h-[420px] overflow-y-auto p-2">
              {matches.map((item) => (
                <Link
                  className="block rounded-lg px-3 py-2 hover:bg-surface-container-low"
                  href={item.href}
                  key={`${item.category}-${item.href}-${item.title}`}
                  onClick={clearSearch}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="truncate text-sm font-semibold text-primary">
                      {item.title}
                    </span>
                    <span className="shrink-0 rounded bg-surface-container px-2 py-0.5 text-[10px] font-bold uppercase text-on-surface-variant">
                      {item.category}
                    </span>
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-on-surface-variant">
                    {item.subtitle}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </form>
  );
}
