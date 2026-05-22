type PayPalToken = {
  access_token: string;
  expires_in: number;
};

export function hasPayPalCredentials() {
  return Boolean(
    process.env.PAYPAL_CLIENT_ID &&
      process.env.PAYPAL_CLIENT_SECRET &&
      process.env.PAYPAL_PLAN_ID_PROFESSIONAL,
  );
}

function paypalBaseUrl() {
  return process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

export async function getPayPalAccessToken(): Promise<PayPalToken> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing PayPal credentials.");
  }

  const response = await fetch(`${paypalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(`PayPal token request failed: ${response.status}`);
  }

  return response.json();
}

export async function createPayPalSubscription(planSlug: string) {
  if (!hasPayPalCredentials()) {
    return {
      mode: "credential_required",
      message:
        "PayPal REST app credentials and plan IDs are required to create subscriptions.",
    };
  }

  const token = await getPayPalAccessToken();
  const planId =
    planSlug === "enterprise"
      ? process.env.PAYPAL_PLAN_ID_ENTERPRISE
      : planSlug === "starter"
        ? process.env.PAYPAL_PLAN_ID_STARTER
        : process.env.PAYPAL_PLAN_ID_PROFESSIONAL;

  if (!planId) {
    throw new Error(`Missing PayPal plan ID for plan slug: ${planSlug}`);
  }

  const response = await fetch(`${paypalBaseUrl()}/v1/billing/subscriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      plan_id: planId,
      application_context: {
        brand_name: "PropFlow",
        user_action: "SUBSCRIBE_NOW",
        return_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/workspace`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/pricing`,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`PayPal subscription request failed: ${response.status}`);
  }

  return response.json();
}
