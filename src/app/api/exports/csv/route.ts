import { NextResponse } from "next/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { getServerSupabase } from "@/lib/supabase/server";
import { getOperationsSnapshot } from "@/lib/data/repository";
import { csvEscape } from "@/lib/utils";

export async function GET() {
  if (hasSupabaseEnv()) {
    const supabase = await getServerSupabase();
    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
      }
    }
  }

  const { bookings, ownerStatements, properties } = await getOperationsSnapshot();
  const rows = [
    ["section", "name", "owner_or_guest", "status", "revenue_or_amount"],
    ...properties.map((property) => [
      "property",
      property.name,
      property.owner,
      property.status,
      property.revenueYtd,
    ]),
    ...bookings.map((booking) => [
      "booking",
      booking.property,
      booking.guest,
      booking.status,
      booking.amount,
    ]),
    ...ownerStatements.map((statement) => [
      "owner_statement",
      statement.id,
      statement.owner,
      statement.status,
      statement.payout,
    ]),
  ];

  const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=propflow-export.csv",
    },
  });
}
