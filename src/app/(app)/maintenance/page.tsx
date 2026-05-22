import { MaintenanceBoard } from "@/components/workflows/maintenance-board";
import { getOperationsSnapshot } from "@/lib/data/repository";

export default async function MaintenancePage() {
  const { issueReports, maintenanceRequests, properties } = await getOperationsSnapshot();
  return (
    <MaintenanceBoard
      issueReports={issueReports}
      properties={properties}
      requests={maintenanceRequests}
    />
  );
}
