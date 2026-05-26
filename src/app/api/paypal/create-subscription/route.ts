import { NextResponse } from "next/server";
import {
  createPayPalSubscription,
  hasPayPalCredentials,
} from "@/lib/integrations/paypal";
import { getServerSupabase } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

const purchasablePlans = new Set(["starter", "professional"]);

function normalizePlan(plan: FormDataEntryValue | string | null) {
  const value = String(plan ?? "professional").toLowerCase();
  return purchasablePlans.has(value) ? value : "professional";
}

async function planFromRequest(request: Request) {
  const url = new URL(request.url);
  if (request.method === "GET") return normalizePlan(url.searchParams.get("plan"));

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = (await request.json().catch(() => null)) as { plan?: string } | null;
    return normalizePlan(body?.plan ?? url.searchParams.get("plan"));
  }

  const formData = await request.formData().catch(() => null);
  return normalizePlan(formData?.get("plan") ?? url.searchParams.get("plan"));
}

async function getWorkspaceId() {
  if (!hasSupabaseEnv()) return null;

  const supabase = await getServerSupabase();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: membership } = await supabase
    .from("memberships")
    .select("workspace_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  return membership?.workspace_id ?? null;
}

function redirectToPricing(request: Request, plan: string, billing: string) {
  const url = new URL("/pricing", request.url);
  url.searchParams.set("plan", plan);
  url.searchParams.set("billing", billing);
  return NextResponse.redirect(url, { status: 303 });
}

function redirectToWorkspaceSetup(request: Request, plan: string) {
  const url = new URL("/workspace", request.url);
  url.searchParams.set("plan", plan);
  return NextResponse.redirect(url, { status: 303 });
}

export async function GET(request: Request) {
  const plan = await planFromRequest(request);
  return redirectToPricing(request, plan, "use_checkout_button");
}

export async function POST(request: Request) {
  const plan = await planFromRequest(request);

  if (!hasSupabaseEnv()) {
    return redirectToWorkspaceSetup(request, plan);
  }

  const workspaceId = await getWorkspaceId();
  if (!workspaceId) {
    return redirectToWorkspaceSetup(request, plan);
  }

  if (!hasPayPalCredentials(plan)) {
    return redirectToPricing(request, plan, "not_configured");
  }

  try {
    const subscription = await createPayPalSubscription(plan, workspaceId);
    if (
      typeof subscription === "object" &&
      subscription !== null &&
      "mode" in subscription
    ) {
      return NextResponse.json(subscription, { status: 428 });
    }

    const approvalLink = Array.isArray(subscription.links)
      ? subscription.links.find((link: { rel: string }) => link.rel === "approve")
      : null;

    if (approvalLink?.href) {
      return NextResponse.redirect(approvalLink.href, { status: 303 });
    }

    return NextResponse.json(subscription);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "PayPal subscription failed.",
      },
      { status: 500 },
    );
  }
}
