import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json() as {
    endpoint?: string;
    keys?: { p256dh?: string; auth?: string };
  };

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

    const endpoint = body?.endpoint;
    const p256dh = body?.keys?.p256dh;
    const auth = body?.keys?.auth;

    if (endpoint && p256dh && auth) {
      await supabase.from("push_subscriptions").upsert(
        {
          user_id: user.id,
          workspace_id: membership?.workspace_id ?? null,
          endpoint,
          p256dh,
          auth,
        },
        { onConflict: "user_id,endpoint" },
      );
    }
  }

  return NextResponse.json({
    ok: true,
    message: supabase
      ? "Push subscription saved."
      : "Demo mode: push subscription accepted but not persisted.",
  });
}
