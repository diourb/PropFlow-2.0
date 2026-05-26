import crypto from "crypto";
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

type OAuthConfig = {
  tokenUrl: string;
  clientIdEnv: string;
  clientSecretEnv: string;
  scopes?: string;
};

const oauthConfigs: Record<string, OAuthConfig> = {
  google_calendar: {
    tokenUrl: "https://oauth2.googleapis.com/token",
    clientIdEnv: "GOOGLE_CALENDAR_CLIENT_ID",
    clientSecretEnv: "GOOGLE_CALENDAR_CLIENT_SECRET",
    scopes: "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events",
  },
  airbnb: {
    tokenUrl: "https://api.airbnb.com/v2/oauth2/token",
    clientIdEnv: "AIRBNB_CLIENT_ID",
    clientSecretEnv: "AIRBNB_CLIENT_SECRET",
  },
  vrbo: {
    tokenUrl: "https://oauth2.vrbo.com/oauth2/v3/token",
    clientIdEnv: "VRBO_CLIENT_ID",
    clientSecretEnv: "VRBO_CLIENT_SECRET",
  },
  quickbooks: {
    tokenUrl: "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
    clientIdEnv: "QUICKBOOKS_CLIENT_ID",
    clientSecretEnv: "QUICKBOOKS_CLIENT_SECRET",
  },
};

function encrypt(text: string): string {
  const key = process.env.INTEGRATION_ENCRYPTION_KEY;
  if (!key) return text;
  const keyBuf = crypto.createHash("sha256").update(key).digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", keyBuf, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

async function exchangeCodeForTokens(
  provider: string,
  code: string,
  redirectUri: string,
): Promise<{ access_token?: string; refresh_token?: string; expires_in?: number; scope?: string } | null> {
  const config = oauthConfigs[provider];
  if (!config) return null;

  const clientId = process.env[config.clientIdEnv];
  const clientSecret = process.env[config.clientSecretEnv];
  if (!clientId || !clientSecret) return null;

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(config.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) return null;
  return res.json() as Promise<{ access_token?: string; refresh_token?: string; expires_in?: number; scope?: string }>;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;
  const url = new URL(request.url);

  if (!supportedProviders.has(provider)) {
    return NextResponse.json({ error: "Unsupported provider." }, { status: 404 });
  }

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

  const workspaceId = membership.workspace_id;
  const adminSupabase = getServiceSupabase();

  const code = url.searchParams.get("code");
  if (code && oauthConfigs[provider]) {
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin}/api/integrations/${provider}/callback`;
    const tokens = await exchangeCodeForTokens(provider, code, redirectUri);

    if (tokens?.access_token && adminSupabase) {
      const expiresAt = tokens.expires_in
        ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
        : null;

      await adminSupabase.from("integration_credentials").upsert(
        {
          workspace_id: workspaceId,
          provider,
          access_token: encrypt(tokens.access_token),
          refresh_token: tokens.refresh_token ? encrypt(tokens.refresh_token) : null,
          expires_at: expiresAt,
          scopes: tokens.scope ? tokens.scope.split(" ") : null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "workspace_id,provider" },
      );

      // Mark integration as connected
      await adminSupabase.from("integrations").upsert(
        {
          workspace_id: workspaceId,
          provider,
          status: "connected",
          metadata: { scope: tokens.scope },
        },
        { onConflict: "workspace_id,provider" },
      );
    }
  } else if (adminSupabase) {
    // Fallback: mark connected without token exchange (e.g. account_id flow)
    await adminSupabase.from("integrations").upsert(
      {
        workspace_id: workspaceId,
        provider,
        status: "connected",
        external_account_id: url.searchParams.get("account_id"),
        access_token_ref: code ? "oauth_code_received" : null,
        metadata: Object.fromEntries(url.searchParams.entries()),
      },
      { onConflict: "workspace_id,provider" },
    );
  }

  return NextResponse.redirect(
    new URL("/settings/workspace?tab=integrations", request.url),
  );
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
