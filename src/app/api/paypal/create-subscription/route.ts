import { NextResponse } from "next/server";
import { createPayPalSubscription } from "@/lib/integrations/paypal";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const plan = url.searchParams.get("plan") ?? "professional";

  try {
    const subscription = await createPayPalSubscription(plan);
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
      return NextResponse.redirect(approvalLink.href);
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
