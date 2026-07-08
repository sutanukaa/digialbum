import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// Store a doodle/template wish. Email is optional.
export async function POST(req: NextRequest) {
  let body: { text?: string; email?: string; kind?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const text = String(body.text ?? "").trim();
  const email = String(body.email ?? "").trim();
  const kind = ["doodle", "template", "general"].includes(body.kind ?? "") ? body.kind : "general";

  if (!text) return NextResponse.json({ error: "tell me what you'd like ♡" }, { status: 400 });
  if (text.length > 500) return NextResponse.json({ error: "a little shorter, please" }, { status: 400 });
  if (email && !email.includes("@")) return NextResponse.json({ error: "that email looks off" }, { status: 400 });

  const { error } = await supabaseAdmin.from("suggestions").insert({ kind, text, email: email || null });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
