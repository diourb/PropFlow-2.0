import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { syncGoogleCalendar } from "@/lib/integrations/google";

export async function POST(request: Request) {
  const channelId = request.headers.get("x-goog-channel-id");
  const resourceState = request.headers.get("x-goog-resource-state");
  const resourceId = request.headers.get("x-goog-resource-id");

  const supabase = getServiceSupabase();
  if (supabase) {
    await supabase.from("audit_logs").insert({
      event_type: "google_calendar.webhook",
      entity_type: "integration",
      entity_id: channelId,
      metadata: { resourceState, resourceId },
    });

    // Only process sync/exists states (not "not_exists" which is a channel expiry)
    if (resourceState === "exists" || resourceState === "sync") {
      // Find workspace associated with this channel
      const { data: integration } = await supabase
        .from("integrations")
        .select("workspace_id, metadata")
        .eq("provider", "google_calendar")
        .eq("status", "connected")
        .maybeSingle();

      const workspaceId = integration?.workspace_id;
      if (workspaceId) {
        // Perform actual sync
        const syncResult = await syncGoogleCalendar(workspaceId);

        // Create an in-app notification about the calendar sync
        await supabase.from("notifications").insert({
          workspace_id: workspaceId,
          channel: "in_app",
          title: "Google Calendar sync",
          body: syncResult.ok
            ? `Successfully synced ${syncResult.count} events from Google Calendar.`
            : "Calendar events were updated, but the sync failed. Please check your credentials.",
          metadata: { channelId, resourceId, resourceState, syncResult },
        });
      }
    }
  }

  return NextResponse.json({ received: true, channelId, resourceState });
}
