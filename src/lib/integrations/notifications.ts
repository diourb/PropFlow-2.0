import { Resend } from "resend";
import twilio from "twilio";

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
  const resend = getResend();

  if (resend && toEmail) {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "PropFlow <alerts@propflow.local>",
      to: toEmail,
      subject,
      text: message,
    });
    sent.push("email");
  }

  const twilioClient = getTwilio();
  if (twilioClient && toPhone && process.env.TWILIO_FROM_NUMBER) {
    await twilioClient.messages.create({
      to: toPhone,
      from: process.env.TWILIO_FROM_NUMBER,
      body: message,
    });
    sent.push("sms");
  }

  return sent;
}
