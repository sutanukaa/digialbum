import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { resolvePhotos } from "@/lib/upload";
import type { Page } from "@/lib/scrapbook";

// Update a scrapbook. Requires the secret edit token. Body: title, pages (JSON),
// photos[] (files) — same shape as create.
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const form = await req.formData();
  const token = String(form.get("token") || "");
  const title = String(form.get("title") || "");
  const files = form.getAll("photos").filter((f): f is File => f instanceof File);
  let pages: Page[];
  try {
    pages = JSON.parse(String(form.get("pages") || "[]"));
  } catch {
    return NextResponse.json({ error: "bad pages payload" }, { status: 400 });
  }

  const { data: row } = await supabaseAdmin
    .from("scrapbooks")
    .select("edit_token")
    .eq("id", id)
    .single();
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (row.edit_token !== token) return NextResponse.json({ error: "not allowed" }, { status: 403 });
  if (!pages.length) return NextResponse.json({ error: "add at least one page" }, { status: 400 });

  const resolved = await resolvePhotos(id, pages, files);
  if ("error" in resolved) return NextResponse.json({ error: resolved.error }, { status: 500 });

  const { error } = await supabaseAdmin
    .from("scrapbooks")
    .update({ title, data: { pages: resolved.pages } })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
