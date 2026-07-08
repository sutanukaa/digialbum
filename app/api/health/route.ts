import { NextResponse } from "next/server";

// Diagnostic only: reports whether the Supabase env vars are present (never their
// values). Safe to remove once deployment is confirmed working.
export function GET() {
  return NextResponse.json({
    hasUrl: !!process.env.SUPABASE_URL,
    hasKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    urlHost: process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).host : null,
  });
}
