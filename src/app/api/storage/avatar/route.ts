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

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const ext = file.name.split(".").at(-1) ?? "jpg";
  const path = `${user.id}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: signedData, error: signError } = await supabase.storage
    .from("avatars")
    .createSignedUrl(path, 60 * 60 * 24);

  if (signError || !signedData?.signedUrl) {
    return NextResponse.json({ error: "Could not generate signed URL." }, { status: 500 });
  }

  // Update profile avatar_url reference
  await supabase.from("profiles").update({ avatar_url: path }).eq("id", user.id);

  return NextResponse.json({ signedUrl: signedData.signedUrl });
}
