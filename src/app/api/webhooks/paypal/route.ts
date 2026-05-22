import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/admin";

async function verifyPayPalWebhook(request: Request, rawBody: string): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  // Verification is skipped until PAYPAL_WEBHOOK_ID is set in env
  if (!webhookId) return true;

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
      webhook_event: JSON.parse(rawBody) as unknown,
    }),
  });

  if (!verifyRes.ok) return false;
  const { verification_status } = (await verifyRes.json()) as { verification_status: string };
  return verification_status === "SUCCESS";
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  const verified = await verifyPayPalWebhook(request, rawBody);
  if (!verified) {
    return NextResponse.json(
      { error: "Webhook signature verification failed." },
      { status: 401 },
    );
  }

  const payload = JSON.parse(rawBody) as Record<string, unknown>;
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
      await supabase.from("subscriptions").upsert(
        {
          external_provider: "paypal",
          external_id: resource.id,
          status:
            (resource.status as string | undefined)?.toLowerCase() ?? "unknown",
          current_period_end:
            (resource.billing_info as Record<string, unknown> | undefined)
              ?.next_billing_time ?? null,
          metadata: resource,
        },
        { onConflict: "external_provider,external_id" },
      );
    }
  }

  return NextResponse.json({ received: true, eventType });
}
