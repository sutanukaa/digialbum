"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Scrapbook, type Item } from "@/components/Scrapbook";

type EditItem = Item & { file: File };

export default function NewScrapbook() {
  const [title, setTitle] = useState("");
  const [items, setItems] = useState<EditItem[]>([]);
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

  function setCaption(id: string, caption: string) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, caption } : it)));
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row">
      {/* ---- controls ---- */}
      <div className="lg:w-[420px] lg:h-screen lg:overflow-y-auto shrink-0 border-b lg:border-b-0 lg:border-r border-ink/10 p-6">
        <Link href="/" className="hand text-2xl text-ink-soft hover:text-ink">
          ← cover
        </Link>

        <h2 className="hand text-4xl text-ink mt-3 mb-6">make your scrapbook</h2>

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

        {/* caption editors */}
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

        {/* save — wired to Supabase next */}
        <button
          disabled={items.length === 0}
          onClick={() => alert("saving + share links come next — just need your Supabase keys 💌")}
          className="w-full mt-8 rounded-full bg-ink text-cream py-3 text-lg
                     shadow-[3px_4px_0_0_rgba(74,64,56,0.25)] transition-transform
                     hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
        >
          save &amp; get a share link →
        </button>
      </div>

      {/* ---- live preview ---- */}
      <div className="flex-1 lg:h-screen lg:overflow-y-auto">
        <Scrapbook title={title} items={items} />
      </div>
    </div>
  );
}
