"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";
import { Search } from "lucide-react";

export function SearchBar() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const q = inputRef.current?.value.trim();
    if (q) {
      router.push(`/properties?q=${encodeURIComponent(q)}`);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <form
      className="hidden h-10 w-[360px] items-center gap-2 rounded-full bg-surface-container-low px-4 ring-1 ring-outline-variant/60 focus-within:ring-secondary md:flex"
      onSubmit={handleSubmit}
    >
      <Search size={18} className="text-outline" />
      <input
        className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-outline"
        placeholder="Search properties, guests, reports..."
        ref={inputRef}
      />
    </form>
  );
}
