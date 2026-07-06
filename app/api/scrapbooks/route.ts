import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { supabaseAdmin } from "@/lib/supabase";

// Create a scrapbook: upload photos to storage, store captions + title, return
// the public id and the secret edit token.
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const title = String(form.get("title") || "");
  const files = form.getAll("photos").filter((f): f is File => f instanceof File);
  const captions = form.getAll("captions").map(String);

  if (files.length === 0) {
    return NextResponse.json({ error: "add at least one photo" }, { status: 400 });
  }

  const id = randomUUID();
  const items: { src: string; caption: string }[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${id}/${i}.${ext}`;
    const buf = Buffer.from(await file.arrayBuffer());

    const { error: upErr } = await supabaseAdmin.storage
      .from("photos")
      .upload(path, buf, { contentType: file.type || "image/jpeg", upsert: true });
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

    const { data: pub } = supabaseAdmin.storage.from("photos").getPublicUrl(path);
    items.push({ src: pub.publicUrl, caption: captions[i] || "" });
  }

  const { data, error } = await supabaseAdmin
    .from("scrapbooks")
    .insert({ id, title, template: "classic", data: { items } })
    .select("id, edit_token")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ id: data.id, editToken: data.edit_token });
}
