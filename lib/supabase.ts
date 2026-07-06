import { createClient } from "@supabase/supabase-js";

// service_role client — server-only. Bypasses RLS, so this must never be
// imported into a client component. Saving/reading all happens through here.
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);
