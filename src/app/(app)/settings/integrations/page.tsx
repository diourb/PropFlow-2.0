import { redirect } from "next/navigation";

export default function SettingsIntegrationsAlias() {
  redirect("/settings/workspace?tab=integrations");
}
