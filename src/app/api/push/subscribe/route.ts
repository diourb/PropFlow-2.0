import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const subscription = await request.json();
  const supabase = await getServerSupabase();

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
    }

    const { data: membership } = await supabase
      .from("memberships")
      .select("workspace_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    await supabase.from("notification_preferences").upsert({
      user_id: user.id,
      workspace_id: membership?.workspace_id ?? null,
      channel: "push",
      enabled: true,
      metadata: subscription,
    });
  }

  return NextResponse.json({
    ok: true,
    message: supabase
      ? "Push subscription saved."
      : "Demo mode: push subscription accepted but not persisted.",
  });
}
