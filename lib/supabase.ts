import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Lazily create the service_role client on FIRST USE. Creating it at module load
// makes `next build` crash during page-data collection when env vars aren't
// present. Runtime still requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
let _client: SupabaseClient | null = null;

function client(): SupabaseClient {
  if (!_client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY env vars");
    }
    _client = createClient(url, key, { auth: { persistSession: false } });
  }
  return _client;
}

// A proxy so callers keep using `supabaseAdmin.from(...)` etc., but the real
// client isn't built until a property is actually accessed (i.e. at runtime).
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const c = client();
    const value = Reflect.get(c as object, prop, receiver);
    return typeof value === "function" ? value.bind(c) : value;
  },
});
