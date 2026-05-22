import { AppShell } from "@/components/app/app-shell";

export default function GuestLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
