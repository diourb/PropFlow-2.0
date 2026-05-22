import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";

const supportedProviders = new Set([
  "airbnb",
  "vrbo",
  "google_calendar",
  "quickbooks",
  "paypal",
]);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;
  const url = new URL(request.url);

  if (!supportedProviders.has(provider)) {
    return NextResponse.json({ error: "Unsupported provider." }, { status: 404 });
  }

  // Verify the requesting user is authenticated
  const serverSupabase = await getServerSupabase();
  if (!serverSupabase) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const {
    data: { user },
  } = await serverSupabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { data: membership } = await serverSupabase
    .from("memberships")
    .select("workspace_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (!membership?.workspace_id) {
    return NextResponse.redirect(new URL("/workspace", request.url));
  }

  const adminSupabase = getServiceSupabase();
  if (adminSupabase) {
    await adminSupabase.from("integrations").upsert(
      {
        workspace_id: membership.workspace_id,
        provider,
        status: "connected",
        external_account_id: url.searchParams.get("account_id"),
        access_token_ref: url.searchParams.get("code") ? "oauth_code_received" : null,
        metadata: Object.fromEntries(url.searchParams.entries()),
      },
      { onConflict: "workspace_id,provider" },
    );
  }

  return NextResponse.redirect(new URL("/settings/workspace", request.url));
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;
  const payload = await request.json();

  if (!supportedProviders.has(provider)) {
    return NextResponse.json({ error: "Unsupported provider." }, { status: 404 });
  }

  const supabase = getServiceSupabase();
  if (supabase) {
    await supabase.from("audit_logs").insert({
      event_type: `${provider}.callback`,
      entity_type: "integration",
      metadata: payload,
    });
  }

  return NextResponse.json({ ok: true, provider });
}
