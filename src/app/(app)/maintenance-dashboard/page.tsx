import { redirect } from "next/navigation";
import { MaintenanceBoard } from "@/components/workflows/maintenance-board";
import { PageHeader } from "@/components/app/page-header";
import { getOperationsSnapshot } from "@/lib/data/repository";

export default async function MaintenanceDashboardPage() {
  const snapshot = await getOperationsSnapshot();
  const allowed = ["platform_admin", "workspace_admin", "manager", "maintenance_tech"];
  if (!allowed.includes(snapshot.session.role)) redirect("/dashboard");

  return (
    <>
      <PageHeader
        title="Maintenance Dashboard"
        description="Your assigned work orders, issue reports, and maintenance board."
      />
      <MaintenanceBoard
        issueReports={snapshot.issueReports}
        properties={snapshot.properties}
        requests={snapshot.maintenanceRequests}
      />
    </>
  );
}
