"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { type El, type Page } from "@/lib/scrapbook";
import type { TemplateDef } from "@/lib/templates";
import { TemplatePage } from "@/components/TemplatePage";
import { ShareModal } from "@/components/ShareModal";
import { useCyclingPlaceholder } from "@/components/useCyclingPlaceholder";

const MAX_EW = 500;

type SlotImg = { file: File; url: string };

export function TemplateEditor({ template }: { template: TemplateDef }) {
  const [title, setTitle] = useState("");
  const [images, setImages] = useState<(SlotImg | undefined)[]>(() => template.slots.map(() => undefined));
  const [texts, setTexts] = useState<string[]>(() => template.texts.map((t) => t.text));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [result, setResult] = useState<{ id: string; editToken: string } | null>(null);

  const fileInput = useRef<HTMLInputElement>(null);
  const pendingSlot = useRef<number | null>(null);
  const textInputs = useRef<(HTMLInputElement | null)[]>([]);
  const stageRef = useRef<HTMLDivElement>(null);

  // responsive page width (TemplatePage is percent-based, so it just scales)
  const [ew, setEw] = useState(MAX_EW);
  const titlePh = useCyclingPlaceholder();
  useEffect(() => {
    const measure = () => {
      const w = stageRef.current?.clientWidth ?? MAX_EW;
      setEw(Math.max(240, Math.min(MAX_EW, w - 16)));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  function pickFor(slot: number) {
    pendingSlot.current = slot;
    fileInput.current?.click();
  }
  function onFile(files: FileList | null) {
    const slot = pendingSlot.current;
    if (files && files[0] && slot !== null) {
      const file = files[0];
      setImages((prev) => prev.map((im, i) => (i === slot ? { file, url: URL.createObjectURL(file) } : im)));
    }
    pendingSlot.current = null;
    if (fileInput.current) fileInput.current.value = "";
  }
  const clearSlot = (slot: number) => setImages((prev) => prev.map((im, i) => (i === slot ? undefined : im)));
  const setText = (k: number, v: string) => setTexts((prev) => prev.map((t, i) => (i === k ? v : t)));

  const filledCount = images.filter(Boolean).length;

  async function save() {
    setSaving(true);
    setErr("");
    try {
      const fd = new FormData();
      fd.append("title", title);

      const elements: El[] = [];
      // decor: behind photos by default, or above them when marked `top`
      template.decor.forEach((d, j) => {
        elements.push({ id: `d${j}`, type: "doodle", src: d.src, x: d.x, y: d.y, w: d.w, rot: d.rot, z: d.top ? 300 + j : j } as El);
      });
      // photos in the middle
      let fileIdx = 0;
      template.slots.forEach((s, i) => {
        const im = images[i];
        if (!im) return;
        fd.append("photos", im.file);
        elements.push({
          id: `p${i}`,
          type: "photo",
          x: s.x,
          y: s.y,
          w: s.w,
          rot: s.rot,
          z: 100 + i,
          upload: fileIdx++,
          ...(s.fit === "bare" ? { bare: true } : {}),
        } as El);
      });
      // text on top
      template.texts.forEach((t, k) => {
        const val = (texts[k] ?? "").trim();
        if (!val) return;
        elements.push({
          id: `t${k}`,
          type: "text",
          text: val,
          x: t.x,
          y: t.y,
          w: t.w,
          rot: t.rot,
          z: 500 + k,
          font: t.font,
          size: t.size,
          color: t.color,
        } as El);
      });

      const pages: Page[] = [{ elements }];
      fd.append("pages", JSON.stringify(pages));

      const res = await fetch("/api/scrapbooks", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "something went wrong");
      setResult({ id: json.id, editToken: json.editToken });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row">
      {/* ---- left: panel ---- */}
      <div className="lg:w-[360px] lg:h-screen lg:overflow-y-auto shrink-0 border-b lg:border-b-0 lg:border-r border-ink/10 p-6 space-y-5">
        <Link href="/templates" className="hand text-2xl text-ink-soft hover:text-ink">
          ← templates
        </Link>

        <div>
          <h2 className="hand text-4xl text-ink leading-tight">{template.name}</h2>
          <p className="text-ink-soft text-sm">{template.blurb}</p>
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={titlePh}
          className="w-full bg-transparent border-b-2 border-ink/20 focus:border-blush outline-none hand text-3xl text-ink placeholder:text-ink-soft/40 pb-1"
        />

        {/* photos */}
        <div>
          <p className="hand text-xl text-ink mb-2">pop your photos in ♡</p>
          <div className="space-y-2">
            {template.slots.map((_, i) => {
              const im = images[i];
              return (
                <div key={i} className="flex items-center gap-3 bg-[#fffdf8]/60 rounded-xl p-2">
                  <span className="hand text-2xl text-ink-soft w-6 text-center shrink-0">{i + 1}</span>
                  {im ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={im.url} alt="" className="w-12 h-12 object-cover rounded-lg shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg border-2 border-dashed border-ink/25 shrink-0" />
                  )}
                  <button onClick={() => pickFor(i)} className="flex-1 text-left hand text-xl text-ink hover:text-blush">
                    {im ? "change photo" : `add photo ${i + 1}`}
                  </button>
                  {im ? (
                    <button onClick={() => clearSlot(i)} className="text-ink-soft hover:text-blush text-lg shrink-0 px-1" aria-label="remove">
                      ✕
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {/* words */}
        {template.texts.length ? (
          <div>
            <p className="hand text-xl text-ink mb-2">titles &amp; words</p>
            <div className="space-y-2">
              {template.texts.map((t, k) => (
                <input
                  key={k}
                  ref={(el) => {
                    textInputs.current[k] = el;
                  }}
                  value={texts[k]}
                  onChange={(e) => setText(k, e.target.value)}
                  placeholder={t.text}
                  className="w-full bg-[#fffdf8]/60 border border-ink/15 rounded-lg px-3 py-2 hand text-xl text-ink outline-none focus:border-blush"
                />
              ))}
            </div>
          </div>
        ) : null}

        <input ref={fileInput} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files)} />

        {err ? <p className="text-blush hand text-xl">{err}</p> : null}

        <button
          disabled={saving || filledCount === 0}
          onClick={save}
          className="w-full rounded-full bg-ink text-cream py-3 text-lg shadow-[3px_4px_0_0_rgba(74,64,56,0.25)] transition-transform hover:-translate-y-0.5 disabled:opacity-40"
        >
          {saving ? "taping it all together…" : "save & get a share link →"}
        </button>
        <p className="text-ink-soft/70 text-xs">tip: tap a blank polaroid to add its photo, or tap words on the page to edit them.</p>
      </div>

      {/* ---- center: the template page ---- */}
      <div ref={stageRef} className="flex-1 flex items-center justify-center p-4 sm:p-6 overflow-auto">
        <div className="shadow-[6px_10px_30px_rgba(74,64,56,0.25)] rounded-[4px]">
          <TemplatePage
            template={template}
            pw={ew}
            images={images.map((im) => im?.url)}
            texts={texts}
            onSlotClick={pickFor}
            onTextClick={(k) => textInputs.current[k]?.focus()}
          />
        </div>
      </div>

      {result ? <ShareModal id={result.id} editToken={result.editToken} edited={false} onClose={() => setResult(null)} /> : null}
    </div>
  );
}
