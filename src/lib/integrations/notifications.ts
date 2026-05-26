import { Resend } from "resend";
import twilio from "twilio";
import webpush from "web-push";

let resendClient: Resend | null = null;
let twilioClient: ReturnType<typeof twilio> | null = null;

export function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

export function getTwilio() {
  if (
    !process.env.TWILIO_ACCOUNT_SID ||
    !process.env.TWILIO_AUTH_TOKEN ||
    !process.env.TWILIO_FROM_NUMBER
  ) {
    return null;
  }
  if (!twilioClient) {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );
  }
  return twilioClient;
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<{ ok: boolean; message: string }> {
  const resend = getResend();
  if (!resend) return { ok: false, message: "Provider not configured" };
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "PropFlow <alerts@propflow.local>",
      to,
      subject,
      html,
    });
    return { ok: true, message: "Email sent." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Email send failed.",
    };
  }
}

export async function sendSms(
  to: string,
  body: string,
): Promise<{ ok: boolean; message: string }> {
  const client = getTwilio();
  if (!client || !process.env.TWILIO_FROM_NUMBER)
    return { ok: false, message: "Provider not configured" };
  try {
    await client.messages.create({
      to,
      from: process.env.TWILIO_FROM_NUMBER,
      body,
    });
    return { ok: true, message: "SMS sent." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "SMS send failed.",
    };
  }
}

export async function sendPushNotification(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: { title: string; body: string },
): Promise<{ ok: boolean; message: string }> {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey)
    return { ok: false, message: "Provider not configured" };
  try {
    webpush.setVapidDetails(
      `mailto:${process.env.RESEND_FROM_EMAIL ?? "admin@propflow.local"}`,
      publicKey,
      privateKey,
    );
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return { ok: true, message: "Push notification sent." };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Push notification failed.",
    };
  }
}

export async function sendOperationalAlert({
  toEmail,
  toPhone,
  subject,
  message,
}: {
  toEmail?: string;
  toPhone?: string;
  subject: string;
  message: string;
}) {
  const sent: string[] = ["in_app"];

  if (toEmail) {
    const result = await sendEmail(toEmail, subject, `<p>${message}</p>`);
    if (result.ok) sent.push("email");
  }

  if (toPhone) {
    const result = await sendSms(toPhone, message);
    if (result.ok) sent.push("sms");
  }

  return sent;
}
