"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Scrapbook, type Item } from "@/components/Scrapbook";

// items already saved carry a src (a Supabase URL) and no file; freshly added
// ones carry a File (and an object-URL src for preview). ponytail: one type,
// the presence of `file` is what tells save whether to upload or keep.
type EditItem = Item & { file?: File };

export function Editor({
  mode,
  scrapbookId,
  token,
  initialTitle = "",
  initialItems = [],
}: {
  mode: "create" | "edit";
  scrapbookId?: string;
  token?: string;
  initialTitle?: string;
  initialItems?: Item[];
}) {
  const [title, setTitle] = useState(initialTitle);
  const [items, setItems] = useState<EditItem[]>(initialItems);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [result, setResult] = useState<{ id: string; editToken: string } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  function addPhotos(files: FileList | null) {
    if (!files) return;
    const next = Array.from(files).map((file, k) => ({
      id: `${Date.now()}-${k}-${file.name}`,
      src: URL.createObjectURL(file),
      caption: "",
      file,
    }));
    setItems((prev) => [...prev, ...next]);
  }

  const setCaption = (id: string, caption: string) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, caption } : it)));
  const remove = (id: string) => setItems((prev) => prev.filter((it) => it.id !== id));

  async function save() {
    setSaving(true);
    setErr("");
    try {
      const fd = new FormData();
      fd.append("title", title);

      let res: Response;
      if (mode === "create") {
        for (const it of items) {
          fd.append("photos", it.file!);
          fd.append("captions", it.caption ?? "");
        }
        res = await fetch("/api/scrapbooks", { method: "POST", body: fd });
      } else {
        // edit: describe order + which photos are kept (src) vs new (uploaded)
        const meta = items.map((it) => ({ caption: it.caption ?? "", src: it.file ? null : it.src }));
        fd.append("meta", JSON.stringify(meta));
        fd.append("token", token ?? "");
        for (const it of items) if (it.file) fd.append("photos", it.file);
        res = await fetch(`/api/scrapbooks/${scrapbookId}`, { method: "PUT", body: fd });
      }

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "something went wrong");
      setResult(
        mode === "create"
          ? { id: json.id, editToken: json.editToken }
          : { id: scrapbookId!, editToken: token! }
      );
    } catch (e) {
      setErr(e instanceof Error ? e.message : "something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row">
      {/* ---- controls ---- */}
      <div className="lg:w-[420px] lg:h-screen lg:overflow-y-auto shrink-0 border-b lg:border-b-0 lg:border-r border-ink/10 p-6">
        <Link href="/" className="hand text-2xl text-ink-soft hover:text-ink">
          ← cover
        </Link>

        <h2 className="hand text-4xl text-ink mt-3 mb-6">
          {mode === "edit" ? "edit your scrapbook" : "make your scrapbook"}
        </h2>

        <label className="block hand text-2xl text-ink mb-1">a title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="our little scrapbook"
          className="w-full bg-transparent border-b-2 border-ink/20 focus:border-blush outline-none
                     hand text-3xl text-ink placeholder:text-ink-soft/40 pb-1 mb-8"
        />

        <button
          onClick={() => fileInput.current?.click()}
          className="w-full rounded-2xl border-2 border-dashed border-ink/25 hover:border-blush
                     hover:bg-blush/5 transition-colors py-8 text-center"
        >
          <span className="hand text-3xl text-ink">＋ tape in photos</span>
          <span className="block text-ink-soft text-sm mt-1">jpg or png, add as many as you like</span>
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => addPhotos(e.target.files)}
        />

        <div className="mt-6 space-y-3">
          {items.map((it, i) => (
            <div key={it.id} className="flex items-center gap-3 bg-[#fffdf8]/60 rounded-xl p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.src} alt="" className="w-14 h-14 object-cover rounded-lg shrink-0" />
              <input
                value={it.caption}
                onChange={(e) => setCaption(it.id, e.target.value)}
                placeholder={`caption ${i + 1}…`}
                className="flex-1 min-w-0 bg-transparent border-b border-ink/15 focus:border-blush
                           outline-none hand text-xl text-ink placeholder:text-ink-soft/40 pb-0.5"
              />
              <button
                onClick={() => remove(it.id)}
                className="text-ink-soft hover:text-blush text-xl shrink-0 px-1"
                aria-label="remove photo"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {err ? <p className="text-blush hand text-xl mt-6">{err}</p> : null}

        <button
          disabled={items.length === 0 || saving}
          onClick={save}
          className="w-full mt-8 rounded-full bg-ink text-cream py-3 text-lg
                     shadow-[3px_4px_0_0_rgba(74,64,56,0.25)] transition-transform
                     hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
        >
          {saving
            ? "taping it all together…"
            : mode === "edit"
              ? "save changes →"
              : "save & get a share link →"}
        </button>
      </div>

      {/* ---- live preview ---- */}
      <div className="flex-1 lg:h-screen lg:overflow-y-auto">
        <Scrapbook title={title} items={items} />
      </div>

      {result ? <SavedCard id={result.id} editToken={result.editToken} edited={mode === "edit"} /> : null}
    </div>
  );
}

function SavedCard({ id, editToken, edited }: { id: string; editToken: string; edited: boolean }) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = `${origin}/s/${id}`;
  const editUrl = `${origin}/s/${id}/edit?token=${editToken}`;

  return (
    <div className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-cream max-w-md w-full rounded-3xl p-8 shadow-2xl text-center border border-ink/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/doodles/heart.png" alt="" className="w-16 h-auto mx-auto mb-2" />
        <h3 className="hand text-4xl text-ink mb-2">{edited ? "saved!" : "it's ready!"}</h3>
        <p className="text-ink-soft mb-6">
          {edited ? "your changes are live ♡" : "share this link with someone you love ♡"}
        </p>

        <LinkRow label="share link" url={shareUrl} />
        {!edited ? (
          <LinkRow
            label="secret edit link — keep this to yourself"
            url={editUrl}
            hint="bookmark it! it's the only way back to edit."
          />
        ) : null}

        <Link
          href={`/s/${id}`}
          className="inline-block mt-6 rounded-full bg-ink text-cream px-8 py-3 text-lg
                     shadow-[3px_4px_0_0_rgba(74,64,56,0.25)] hover:-translate-y-0.5 transition-transform"
        >
          open my scrapbook →
        </Link>
      </div>
    </div>
  );
}

function LinkRow({ label, url, hint }: { label: string; url: string; hint?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="text-left mb-4">
      <p className="hand text-xl text-ink">{label}</p>
      <div className="flex gap-2 mt-1">
        <input
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          className="flex-1 min-w-0 bg-[#fffdf8] border border-ink/15 rounded-lg px-3 py-2 text-sm text-ink-soft"
        />
        <button
          onClick={() => {
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="shrink-0 rounded-lg bg-ink text-cream px-4 text-sm hover:-translate-y-0.5 transition-transform"
        >
          {copied ? "copied!" : "copy"}
        </button>
      </div>
      {hint ? <p className="text-ink-soft/70 text-xs mt-1">{hint}</p> : null}
    </div>
  );
}
