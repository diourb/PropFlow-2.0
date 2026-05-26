import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export async function POST(request: Request) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json(
      { error: "Storage requires Supabase configuration." },
      { status: 400 },
    );
  }

  const supabase = await getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Database not available." }, { status: 500 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const requestId = String(form.get("requestId") ?? "unknown");

  if (!requestId || requestId === "unknown") {
    return NextResponse.json({ error: "Request ID is required." }, { status: 400 });
  }

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const { data: maintenanceRequest } = await supabase
    .from("maintenance_requests")
    .select("id, workspace_id")
    .eq("id", requestId)
    .maybeSingle();

  if (!maintenanceRequest) {
    return NextResponse.json({ error: "Work order not found." }, { status: 404 });
  }

  const ext = file.name.split(".").at(-1) ?? "jpg";
  const path = `maintenance/${requestId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("attachments")
    .upload(path, file, { upsert: false, contentType: file.type });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  await supabase.from("attachments").insert({
    workspace_id: maintenanceRequest.workspace_id,
    entity_type: "maintenance_request",
    entity_id: requestId,
    bucket: "attachments",
    path,
    mime_type: file.type || "application/octet-stream",
    uploaded_by: user.id,
  });

  const { data: signedData, error: signError } = await supabase.storage
    .from("attachments")
    .createSignedUrl(path, 60 * 60 * 24);

  if (signError || !signedData?.signedUrl) {
    return NextResponse.json({ error: "Could not generate signed URL." }, { status: 500 });
  }

  return NextResponse.json({ signedUrl: signedData.signedUrl, path });
}
