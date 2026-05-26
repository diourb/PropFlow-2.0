"use client";

import Link from "next/link";
import { Building2, Menu, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#roles", label: "Roles" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/dashboard", label: "Live Demo" },
];

export function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-outline-variant/30 bg-surface/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 md:px-10">
        <Link className="flex items-center gap-2.5" href="/">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-container text-on-primary">
            <Building2 size={20} />
          </span>
          <span className="font-heading text-2xl font-bold text-primary">PropFlow</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              className="text-sm font-semibold text-on-surface-variant transition hover:text-primary"
              href={href}
              key={href}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            className="hidden text-sm font-semibold text-on-surface-variant transition hover:text-primary md:inline-flex"
            href="/login"
          >
            Login
          </Link>
          <Link
            className="inline-flex h-10 items-center rounded-xl bg-primary-container px-5 text-sm font-bold text-on-primary ambient-shadow transition hover:bg-primary"
            href="/workspace"
          >
            Get Started Free
          </Link>
          <button
            aria-label="Open menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant md:hidden"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-on-background/40 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 flex h-full w-[280px] flex-col bg-surface p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-heading text-xl font-bold text-primary">PropFlow</span>
              <button
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant"
                onClick={() => setMenuOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {navLinks.map(({ href, label }) => (
                <Link
                  className="rounded-lg px-4 py-3 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
                  href={href}
                  key={href}
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
              <div className="my-4 h-px bg-outline-variant/50" />
              <Link
                className="rounded-lg px-4 py-3 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
                href="/login"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                className="mt-2 flex h-11 items-center justify-center rounded-xl bg-primary-container text-sm font-bold text-on-primary"
                href="/workspace"
                onClick={() => setMenuOpen(false)}
              >
                Get Started Free
              </Link>
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}
