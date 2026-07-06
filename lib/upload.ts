import { randomUUID } from "crypto";
import { supabaseAdmin } from "@/lib/supabase";
import type { Page, El } from "@/lib/scrapbook";

// Upload any photo elements flagged with `upload: <index>` (new photos) to the
// `photos` bucket under the scrapbook id, replacing them with a public URL.
// Elements that already have a src are left untouched.
export async function resolvePhotos(
  id: string,
  pages: Page[],
  files: File[]
): Promise<{ pages: Page[] } | { error: string }> {
  const out: Page[] = [];
  for (const page of pages) {
    const els: El[] = [];
    for (const el of page.elements) {
      if (el.type === "photo" && typeof el.upload === "number") {
        const file = files[el.upload];
        if (!file) return { error: "photo mismatch" };
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
        const path = `${id}/${randomUUID()}.${ext}`;
        const buf = Buffer.from(await file.arrayBuffer());
        const { error } = await supabaseAdmin.storage
          .from("photos")
          .upload(path, buf, { contentType: file.type || "image/jpeg", upsert: true });
        if (error) return { error: error.message };
        const { data: pub } = supabaseAdmin.storage.from("photos").getPublicUrl(path);
        const { upload, ...rest } = el;
        void upload;
        els.push({ ...rest, src: pub.publicUrl });
      } else {
        els.push(el);
      }
    }
    out.push({ elements: els });
  }
  return { pages: out };
}
