import { PageHeader } from "@/components/app/page-header";
import { GuestsManager } from "@/components/workflows/guests-manager";
import { getOperationsSnapshot } from "@/lib/data/repository";

export default async function GuestsPage() {
  const { guests } = await getOperationsSnapshot();

  return (
    <>
      <PageHeader
        title="Guest CRM"
        description="Manage guest, tenant, and corporate client relationships."
      />
      <GuestsManager initialGuests={guests} />
    </>
  );
}
