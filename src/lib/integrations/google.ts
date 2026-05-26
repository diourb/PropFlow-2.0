import { getServiceSupabase } from "@/lib/supabase/admin";

export async function getGoogleCalendarEvents(workspaceId: string) {
  const supabase = getServiceSupabase();
  if (!supabase) return null;

  // 1. Get credentials
  const { data: credentials } = await supabase
    .from("integration_credentials")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("provider", "google_calendar")
    .maybeSingle();

  if (!credentials || !credentials.access_token) return null;

  // 2. Fetch events from Google Calendar API
  try {
    const response = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=" +
        new Date().toISOString(),
      {
        headers: {
          Authorization: `Bearer ${credentials.access_token}`,
        },
      },
    );

    if (response.status === 401) {
      // Token might be expired - in a real app, we would refresh it here using the refresh_token
      return { error: "unauthorized" };
    }

    if (!response.ok) return null;

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("Failed to fetch Google Calendar events:", error);
    return null;
  }
}

export async function syncGoogleCalendar(workspaceId: string) {
  const events = await getGoogleCalendarEvents(workspaceId);
  if (!events || events.error) return { ok: false };

  const supabase = getServiceSupabase();
  if (!supabase) return { ok: false };

  // Update integration status/last sync
  await supabase
    .from("integrations")
    .update({
      status: "connected",
      updated_at: new Date().toISOString(),
      metadata: { last_sync_count: events.length },
    })
    .eq("workspace_id", workspaceId)
    .eq("provider", "google_calendar");

  return { ok: true, count: events.length };
}
