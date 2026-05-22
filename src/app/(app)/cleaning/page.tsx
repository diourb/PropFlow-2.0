import { CleaningWorkspace } from "@/components/workflows/cleaning-workspace";
import { getOperationsSnapshot } from "@/lib/data/repository";

export default async function CleaningPage() {
  const { checklistItems, cleaningTasks, properties } = await getOperationsSnapshot();
  return (
    <CleaningWorkspace
      checklistItems={checklistItems}
      properties={properties}
      tasks={cleaningTasks}
    />
  );
}
