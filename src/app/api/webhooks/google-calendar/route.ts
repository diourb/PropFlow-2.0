import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/admin";

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
  }

  return NextResponse.json({ received: true, channelId, resourceState });
}
