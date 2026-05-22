import { PageHeader } from "@/components/app/page-header";
import { OwnersManager } from "@/components/workflows/owners-manager";
import { getOperationsSnapshot } from "@/lib/data/repository";

export default async function OwnersPage() {
  const { ownerStatements, owners, properties } = await getOperationsSnapshot();

  return (
    <>
      <PageHeader
        title="Owners"
        description="Manage owner contacts, property assignments, reports, payouts, and statements."
      />
      <OwnersManager
        initialOwners={owners}
        ownerStatements={ownerStatements}
        properties={properties}
      />
    </>
  );
}
