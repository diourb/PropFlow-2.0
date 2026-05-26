type PayPalToken = {
  access_token: string;
  expires_in: number;
};

const planEnvKeys = {
  starter: "PAYPAL_PLAN_ID_STARTER",
  professional: "PAYPAL_PLAN_ID_PROFESSIONAL",
  enterprise: "PAYPAL_PLAN_ID_ENTERPRISE",
} as const;

export type PayPalPlanSlug = keyof typeof planEnvKeys;

export function getPayPalPlanId(planSlug: string) {
  const envKey = planEnvKeys[planSlug as PayPalPlanSlug] ?? planEnvKeys.professional;
  return process.env[envKey];
}

export function hasPayPalCredentials(planSlug = "professional") {
  return Boolean(
    process.env.PAYPAL_CLIENT_ID &&
      process.env.PAYPAL_CLIENT_SECRET &&
      getPayPalPlanId(planSlug),
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

export async function createPayPalSubscription(planSlug: string, workspaceId?: string) {
  if (!hasPayPalCredentials(planSlug)) {
    return {
      mode: "credential_required",
      message:
        "PayPal REST app credentials and plan IDs are required to create subscriptions.",
    };
  }

  const token = await getPayPalAccessToken();
  const planId = getPayPalPlanId(planSlug);

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
      ...(workspaceId ? { custom_id: workspaceId } : {}),
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
