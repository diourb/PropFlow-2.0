import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/admin";

async function verifyPayPalWebhook(
  request: Request,
  webhookEvent: Record<string, unknown>,
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) return process.env.NODE_ENV !== "production";

  const transmissionId = request.headers.get("paypal-transmission-id");
  const timestamp = request.headers.get("paypal-transmission-time");
  const certUrl = request.headers.get("paypal-cert-url");
  const transmissionSig = request.headers.get("paypal-transmission-sig");
  const authAlgo = request.headers.get("paypal-auth-algo");

  if (!transmissionId || !timestamp || !certUrl || !transmissionSig || !authAlgo) return false;

  // Prevent SSRF — only accept official PayPal cert URLs
  try {
    const certHost = new URL(certUrl).hostname;
    if (certHost !== "api.paypal.com" && certHost !== "api.sandbox.paypal.com") return false;
  } catch {
    return false;
  }

  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) return false;

  const baseUrl =
    process.env.PAYPAL_ENV === "live"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

  const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!tokenRes.ok) return false;
  const { access_token } = (await tokenRes.json()) as { access_token: string };

  const verifyRes = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      auth_algo: authAlgo,
      cert_url: certUrl,
      transmission_id: transmissionId,
      transmission_sig: transmissionSig,
      transmission_time: timestamp,
      webhook_id: webhookId,
      webhook_event: webhookEvent,
    }),
  });

  if (!verifyRes.ok) return false;
  const { verification_status } = (await verifyRes.json()) as { verification_status: string };
  return verification_status === "SUCCESS";
}

function planSlugFromPayPalPlanId(paypalPlanId: string): string {
  if (paypalPlanId === process.env.PAYPAL_PLAN_ID_STARTER) return "starter";
  if (paypalPlanId === process.env.PAYPAL_PLAN_ID_ENTERPRISE) return "enterprise";
  return "professional";
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  let payload: Record<string, unknown>;

  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Malformed PayPal webhook payload." }, { status: 400 });
  }

  const verified = await verifyPayPalWebhook(request, payload);
  if (!verified) {
    return NextResponse.json(
      { error: "Webhook signature verification failed." },
      { status: 401 },
    );
  }

  const eventType = payload.event_type as string | undefined;
  const resource = (payload.resource ?? {}) as Record<string, unknown>;

  const supabase = getServiceSupabase();
  if (supabase) {
    await supabase.from("audit_logs").insert({
      event_type: "paypal.webhook",
      entity_type: "subscription",
      entity_id: resource.id ?? null,
      metadata: payload,
    });

    if (eventType?.startsWith("BILLING.SUBSCRIPTION")) {
      // Upsert subscription row
      const subscriptionId = String(resource.id ?? "");
      const customId = String(resource.custom_id ?? "");
      const planId = String(
        (resource.plan_id as string | undefined) ?? "",
      );
      const planSlug = planId ? planSlugFromPayPalPlanId(planId) : "professional";

      await supabase.from("subscriptions").upsert(
        {
          external_provider: "paypal",
          external_id: subscriptionId,
          workspace_id: customId || null,
          plan_slug: planSlug,
          status:
            (resource.status as string | undefined)?.toLowerCase() ?? "unknown",
          current_period_end:
            (resource.billing_info as Record<string, unknown> | undefined)
              ?.next_billing_time ?? null,
          metadata: resource,
        },
        { onConflict: "external_provider,external_id" },
      );

      // Update workspace status based on event type
      const workspaceId = customId;
      if (workspaceId) {
        if (
          eventType === "BILLING.SUBSCRIPTION.ACTIVATED" ||
          eventType === "BILLING.SUBSCRIPTION.RENEWED"
        ) {
          await supabase
            .from("workspaces")
            .update({ status: "active", plan_slug: planSlug })
            .eq("id", workspaceId);
        } else if (
          eventType === "BILLING.SUBSCRIPTION.CANCELLED" ||
          eventType === "BILLING.SUBSCRIPTION.SUSPENDED" ||
          eventType === "BILLING.SUBSCRIPTION.PAYMENT.FAILED"
        ) {
          await supabase
            .from("workspaces")
            .update({ status: "past_due" })
            .eq("id", workspaceId);
        }
      }
    }
  }

  return NextResponse.json({ received: true, eventType });
}
