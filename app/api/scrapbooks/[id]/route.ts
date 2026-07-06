import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { supabaseAdmin } from "@/lib/supabase";

// Update a scrapbook. Requires the secret edit token. `meta` describes the new
// order + captions; entries with src are kept as-is, entries without get the
// next uploaded file.
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const form = await req.formData();
  const token = String(form.get("token") || "");
  const title = String(form.get("title") || "");
  const meta = JSON.parse(String(form.get("meta") || "[]")) as { caption: string; src: string | null }[];
  const files = form.getAll("photos").filter((f): f is File => f instanceof File);

  const { data: row } = await supabaseAdmin
    .from("scrapbooks")
    .select("edit_token")
    .eq("id", id)
    .single();
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (row.edit_token !== token) return NextResponse.json({ error: "not allowed" }, { status: 403 });

  if (meta.length === 0) {
    return NextResponse.json({ error: "add at least one photo" }, { status: 400 });
  }

  let fi = 0;
  const items: { src: string; caption: string }[] = [];
  for (const m of meta) {
    if (m.src) {
      items.push({ src: m.src, caption: m.caption || "" });
      continue;
    }
    const file = files[fi++];
    if (!file) return NextResponse.json({ error: "photo mismatch" }, { status: 400 });
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${id}/${randomUUID()}.${ext}`;
    const buf = Buffer.from(await file.arrayBuffer());
    const { error: upErr } = await supabaseAdmin.storage
      .from("photos")
      .upload(path, buf, { contentType: file.type || "image/jpeg", upsert: true });
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });
    const { data: pub } = supabaseAdmin.storage.from("photos").getPublicUrl(path);
    items.push({ src: pub.publicUrl, caption: m.caption || "" });
  }

  const { error } = await supabaseAdmin
    .from("scrapbooks")
    .update({ title, data: { items } })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
