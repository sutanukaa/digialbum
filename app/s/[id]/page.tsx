import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { Scrapbook, type Item } from "@/components/Scrapbook";

export default async function ViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data } = await supabaseAdmin
    .from("scrapbooks")
    .select("title, data")
    .eq("id", id)
    .single();

  if (!data) notFound();

  const items: Item[] = (data.data?.items ?? []).map(
    (it: { src: string; caption?: string }, i: number) => ({ id: String(i), ...it })
  );

  return (
    <main className="flex-1">
      <Scrapbook title={data.title} items={items} />

      {/* gentle "make your own" invitation at the bottom */}
      <div className="text-center pb-16 pt-4">
        <Link href="/" className="hand text-2xl text-ink-soft hover:text-ink underline decoration-wavy">
          make your own little scrapbook ♡
        </Link>
      </div>
    </main>
  );
}
