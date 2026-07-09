import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { toPages } from "@/lib/scrapbook";
import BookView from "@/components/BookView";
import { ScrapbookExport } from "@/components/ScrapbookExport";

export default async function ViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data } = await supabaseAdmin
    .from("scrapbooks")
    .select("title, data")
    .eq("id", id)
    .single();

  if (!data) notFound();

  const pages = toPages(data.data);

  return (
    <main className="flex-1 flex flex-col items-center">
      {data.title ? (
        <h1 className="hand text-5xl sm:text-6xl text-ink text-center pt-10 px-6">{data.title}</h1>
      ) : null}

      <BookView pages={pages} />

      <div className="pb-8">
        <ScrapbookExport pages={pages} title={data.title ?? ""} />
      </div>

      <div className="text-center pb-16">
        <Link href="/" className="hand text-2xl text-ink-soft hover:text-ink underline decoration-wavy">
          make your own little scrapbook ♡
        </Link>
      </div>
    </main>
  );
}
