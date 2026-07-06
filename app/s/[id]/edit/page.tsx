import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { Editor } from "@/components/Editor";
import type { Item } from "@/components/Scrapbook";

export default async function EditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { id } = await params;
  const { token } = await searchParams;

  const { data } = await supabaseAdmin
    .from("scrapbooks")
    .select("title, data, edit_token")
    .eq("id", id)
    .single();

  if (!data) notFound();

  // gate: the secret token must match, or no editor for you
  if (!token || token !== data.edit_token) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <h1 className="hand text-5xl text-ink mb-3">this is someone&apos;s private edit link</h1>
        <p className="text-ink-soft text-lg mb-6">
          you need the secret link to edit this scrapbook.
        </p>
        <Link href={`/s/${id}`} className="hand text-2xl text-ink underline decoration-wavy">
          view the scrapbook instead →
        </Link>
      </main>
    );
  }

  const initialItems: Item[] = (data.data?.items ?? []).map(
    (it: { src: string; caption?: string }, i: number) => ({
      id: String(i),
      src: it.src,
      caption: it.caption ?? "",
    })
  );

  return (
    <Editor
      mode="edit"
      scrapbookId={id}
      token={token}
      initialTitle={data.title ?? ""}
      initialItems={initialItems}
    />
  );
}
