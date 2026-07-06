import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { supabaseAdmin } from "@/lib/supabase";
import { resolvePhotos } from "@/lib/upload";
import type { Page } from "@/lib/scrapbook";

// Create a scrapbook. Body: title, pages (JSON), photos[] (files). Photo elements
// that reference a new upload carry `upload: <index into photos>`.
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const title = String(form.get("title") || "");
  const files = form.getAll("photos").filter((f): f is File => f instanceof File);
  let pages: Page[];
  try {
    pages = JSON.parse(String(form.get("pages") || "[]"));
  } catch {
    return NextResponse.json({ error: "bad pages payload" }, { status: 400 });
  }
  if (!pages.length) return NextResponse.json({ error: "add at least one page" }, { status: 400 });

  const id = randomUUID();
  const resolved = await resolvePhotos(id, pages, files);
  if ("error" in resolved) return NextResponse.json({ error: resolved.error }, { status: 500 });

  const { data, error } = await supabaseAdmin
    .from("scrapbooks")
    .insert({ id, title, template: "notebook", data: { pages: resolved.pages } })
    .select("id, edit_token")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ id: data.id, editToken: data.edit_token });
}
