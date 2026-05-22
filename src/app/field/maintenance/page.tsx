import { redirect } from "next/navigation";
import { MaintenanceBoard } from "@/components/workflows/maintenance-board";
import { getOperationsSnapshot } from "@/lib/data/repository";

export default async function FieldMaintenancePage() {
  const snapshot = await getOperationsSnapshot();
  const allowed = ["platform_admin", "workspace_admin", "manager", "maintenance_tech"];
  if (!allowed.includes(snapshot.session.role)) redirect("/dashboard");
  return (
    <MaintenanceBoard
      issueReports={snapshot.issueReports}
      properties={snapshot.properties}
      requests={snapshot.maintenanceRequests}
    />
  );
}
