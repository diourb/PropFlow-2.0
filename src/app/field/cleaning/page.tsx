import { redirect } from "next/navigation";
import { CleaningWorkspace } from "@/components/workflows/cleaning-workspace";
import { getOperationsSnapshot } from "@/lib/data/repository";

export default async function FieldCleaningPage() {
  const snapshot = await getOperationsSnapshot();
  const allowed = ["platform_admin", "workspace_admin", "manager", "cleaner"];
  if (!allowed.includes(snapshot.session.role)) redirect("/dashboard");
  return (
    <CleaningWorkspace
      checklistItems={snapshot.checklistItems}
      properties={snapshot.properties}
      tasks={snapshot.cleaningTasks}
    />
  );
}
