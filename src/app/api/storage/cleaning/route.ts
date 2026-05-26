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
  const taskId = String(form.get("taskId") ?? "unknown");

  if (!taskId || taskId === "unknown") {
    return NextResponse.json({ error: "Task ID is required." }, { status: 400 });
  }

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const { data: task } = await supabase
    .from("cleaning_tasks")
    .select("id, workspace_id")
    .eq("id", taskId)
    .maybeSingle();

  if (!task) {
    return NextResponse.json({ error: "Cleaning task not found." }, { status: 404 });
  }

  const ext = file.name.split(".").at(-1) ?? "jpg";
  const path = `cleaning/${taskId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("attachments")
    .upload(path, file, { upsert: false, contentType: file.type });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  await supabase.from("attachments").insert({
    workspace_id: task.workspace_id,
    entity_type: "cleaning_task",
    entity_id: taskId,
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
