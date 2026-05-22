import crypto from "crypto";
import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/admin";

function verifyTwilioSignature(
  authToken: string,
  url: string,
  params: Record<string, string>,
  signature: string,
): boolean {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => key + params[key])
    .join("");
  const data = url + sortedParams;
  const computed = crypto.createHmac("sha1", authToken).update(data, "utf8").digest("base64");
  try {
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const signature = request.headers.get("x-twilio-signature") ?? "";

  const form = await request.formData();
  const params: Record<string, string> = {};
  form.forEach((value, key) => {
    params[key] = String(value);
  });

  if (authToken && !verifyTwilioSignature(authToken, request.url, params, signature)) {
    return new Response("<Response></Response>", {
      status: 403,
      headers: { "Content-Type": "text/xml" },
    });
  }

  const messageSid = params.MessageSid ?? "";
  const from = params.From ?? "";
  const body = params.Body ?? "";

  const supabase = getServiceSupabase();
  if (supabase) {
    await supabase.from("notifications").insert({
      channel: "sms",
      title: "Inbound SMS",
      body,
      metadata: { messageSid, from },
    });
  }

  return new Response("<Response></Response>", {
    headers: { "Content-Type": "text/xml" },
  });
}

export async function GET() {
  return NextResponse.json({ status: "twilio webhook ready" });
}
