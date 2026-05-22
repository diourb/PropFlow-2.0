import { AppShell } from "@/components/app/app-shell";

export default function FieldMaintenanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
