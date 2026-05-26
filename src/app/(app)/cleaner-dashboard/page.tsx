import { redirect } from "next/navigation";
import { CleaningWorkspace } from "@/components/workflows/cleaning-workspace";
import { PageHeader } from "@/components/app/page-header";
import { getOperationsSnapshot } from "@/lib/data/repository";

export default async function CleanerDashboardPage() {
  const snapshot = await getOperationsSnapshot();
  const allowed = ["platform_admin", "workspace_admin", "manager", "cleaner"];
  if (!allowed.includes(snapshot.session.role)) redirect("/dashboard");

  return (
    <>
      <PageHeader
        title="Cleaning Dashboard"
        description="Your assigned cleaning tasks, checklists, and issue reporting."
      />
      <CleaningWorkspace
        checklistItems={snapshot.checklistItems}
        properties={snapshot.properties}
        tasks={snapshot.cleaningTasks}
      />
    </>
  );
}
