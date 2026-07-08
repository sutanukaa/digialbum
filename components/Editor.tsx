"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Moveable from "react-moveable";
import {
  DOODLE_TRAY,
  TEXT_COLORS,
  PAGE_RATIO,
  emptyPage,
  type El,
  type Page,
  type TextEl,
  type PhotoEl,
} from "@/lib/scrapbook";
import { textCss, TextContent, TEXT_STYLES } from "@/components/StyledText";
import { SuggestionForm } from "@/components/SuggestionForm";
import { HeartsBurst } from "@/components/HeartsBurst";
import { useCyclingPlaceholder } from "@/components/useCyclingPlaceholder";

const MAX_EW = 520;

const rid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.round(Math.random() * 1e6)}`;

export function Editor({
  mode,
  scrapbookId,
  token,
  initialTitle = "",
  initialPages,
}: {
  mode: "create" | "edit";
  scrapbookId?: string;
  token?: string;
  initialTitle?: string;
  initialPages?: Page[];
}) {
  const [title, setTitle] = useState(initialTitle);
  const [pages, setPages] = useState<Page[]>(initialPages?.length ? initialPages : [emptyPage()]);
  const [cur, setCur] = useState(0);
  const [selId, setSelId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [result, setResult] = useState<{ id: string; editToken: string } | null>(null);
  const [target, setTarget] = useState<HTMLElement | null>(null);

  const filesById = useRef<Record<string, File>>({});
  const elRefs = useRef<Record<string, HTMLElement | null>>({});
  const frames = useRef<Record<string, { tx: number; ty: number; rot: number }>>({});
  const photoInput = useRef<HTMLInputElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // responsive canvas: render the page at whatever width fits (measured live).
  // No CSS scaling, so Moveable's drag/resize math stays exact.
  const [ew, setEw] = useState(MAX_EW);
  const eh = Math.round(ew * PAGE_RATIO);
  const titlePh = useCyclingPlaceholder();

  const page = pages[cur];
  const els = page.elements;
  const selected = els.find((e) => e.id === selId) ?? null;

  // ---- helpers ----
  const pxX = (el: El) => (el.x / 100) * ew;
  const pxY = (el: El) => (el.y / 100) * eh;
  const pxW = (el: El) => (el.w / 100) * ew;

  function mutatePage(fn: (els: El[]) => El[]) {
    setPages((prev) => prev.map((p, i) => (i === cur ? { elements: fn(p.elements) } : p)));
  }

  function updateEl(id: string, patch: Partial<El>) {
    mutatePage((els) => els.map((e) => (e.id === id ? ({ ...e, ...patch } as El) : e)));
  }

  const nextZ = () => (els.length ? Math.max(...els.map((e) => e.z)) + 1 : 1);
  const minZ = () => (els.length ? Math.min(...els.map((e) => e.z)) - 1 : 0);

  function addPhotos(files: FileList | null) {
    if (!files) return;
    const additions: El[] = Array.from(files).map((file, k) => {
      const id = rid();
      filesById.current[id] = file;
      return {
        id,
        type: "photo",
        src: URL.createObjectURL(file),
        x: 28 + (k % 3) * 4,
        y: 22 + (k % 3) * 4,
        w: 40,
        rot: k % 2 ? 3 : -3,
        z: nextZ() + k,
      } as El;
    });
    mutatePage((els) => [...els, ...additions]);
    setSelId(additions[additions.length - 1].id);
  }

  function addDoodle(src: string) {
    const id = rid();
    mutatePage((els) => [
      ...els,
      { id, type: "doodle", src, x: 40, y: 38, w: src.includes("/tape") ? 26 : 16, rot: -4, z: nextZ() } as El,
    ]);
    setSelId(id);
  }

  function addText() {
    const id = rid();
    mutatePage((els) => [
      ...els,
      { id, type: "text", text: "write here…", x: 22, y: 44, w: 56, rot: 0, z: nextZ(), font: "hand", size: 7, color: TEXT_COLORS[0] } as El,
    ]);
    setSelId(id);
  }

  function removeSel() {
    if (!selId) return;
    mutatePage((els) => els.filter((e) => e.id !== selId));
    setSelId(null);
  }

  function addPage() {
    setPages((prev) => [...prev, emptyPage()]);
    setCur(pages.length);
    setSelId(null);
  }
  function deletePage() {
    if (pages.length === 1) return;
    setPages((prev) => prev.filter((_, i) => i !== cur));
    setCur((c) => Math.max(0, c - 1));
    setSelId(null);
  }

  // ---- save ----
  async function save() {
    setSaving(true);
    setErr("");
    try {
      const fd = new FormData();
      fd.append("title", title);

      // serialize pages; new photos become {upload: index}, files appended in order
      let fileIdx = 0;
      const serialized: Page[] = pages.map((p) => ({
        elements: p.elements.map((e) => {
          if (e.type === "photo" && filesById.current[e.id]) {
            fd.append("photos", filesById.current[e.id]);
            const { src, ...rest } = e;
            void src;
            return { ...rest, upload: fileIdx++ } as El;
          }
          return e;
        }),
      }));
      fd.append("pages", JSON.stringify(serialized));
      if (mode === "edit") fd.append("token", token ?? "");

      const res =
        mode === "create"
          ? await fetch("/api/scrapbooks", { method: "POST", body: fd })
          : await fetch(`/api/scrapbooks/${scrapbookId}`, { method: "PUT", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "something went wrong");
      setResult(mode === "create" ? { id: json.id, editToken: json.editToken } : { id: scrapbookId!, editToken: token! });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "something went wrong");
    } finally {
      setSaving(false);
    }
  }

  // resolve the selected element's DOM node AFTER commit (refs populate post-render),
  // so Moveable attaches to a real, mounted node — the first drag is smooth, not late.
  useEffect(() => {
    setTarget(selId ? elRefs.current[selId] ?? null : null);
  }, [selId, cur, pages]);

  // fit the page to the available width
  useEffect(() => {
    const measure = () => {
      const w = stageRef.current?.clientWidth ?? MAX_EW;
      setEw(Math.max(240, Math.min(MAX_EW, w - 16)));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <div className="flex-1 flex flex-col lg:flex-row">
      {/* ---- left: tools ---- */}
      <div className="lg:w-[340px] lg:h-screen lg:overflow-y-auto shrink-0 border-b lg:border-b-0 lg:border-r border-ink/10 p-5 space-y-5">
        <Link href="/" className="hand text-2xl text-ink-soft hover:text-ink">
          ← cover
        </Link>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={titlePh}
          className="w-full bg-transparent border-b-2 border-ink/20 focus:border-blush outline-none hand text-3xl text-ink placeholder:text-ink-soft/40 pb-1"
        />

        {/* add tools */}
        <div className="grid grid-cols-3 gap-2">
          <ToolBtn onClick={() => photoInput.current?.click()} label="＋ photo" />
          <ToolBtn onClick={addText} label="＋ text" />
          <ToolBtn onClick={addPage} label="＋ page" />
        </div>
        <input ref={photoInput} type="file" accept="image/*" multiple hidden onChange={(e) => addPhotos(e.target.files)} />

        {/* doodle tray */}
        <div>
          <p className="hand text-xl text-ink mb-2">tape in a doodle</p>
          <div className="grid grid-cols-5 gap-2 max-h-56 overflow-y-auto pr-1">
            {DOODLE_TRAY.map((src) => (
              <button
                key={src}
                onClick={() => addDoodle(src)}
                className="aspect-square rounded-lg bg-[#fffdf8]/70 border border-ink/10 hover:border-blush hover:scale-110 hover:z-10 transition-transform p-1 flex items-center justify-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="max-w-full max-h-full object-contain" />
              </button>
            ))}
          </div>
          <p className="hand text-lg text-ink-soft/80 mt-2 text-center">
            more little doodles on the way… ✿ pinky promise
          </p>
          <div className="mt-3">
            <SuggestionForm kind="doodle" placeholder="wish for a doodle…" trigger="want a doodle? ask me ♡" />
          </div>
        </div>

        {/* selected-element controls */}
        {selected ? (
          <SelectedControls
            el={selected}
            onDelete={removeSel}
            onFront={() => updateEl(selected.id, { z: nextZ() })}
            onBack={() => updateEl(selected.id, { z: minZ() })}
            onChange={(patch) => updateEl(selected.id, patch)}
          />
        ) : (
          <p className="text-ink-soft text-sm">tap anything on the page to move, resize, rotate, or edit it.</p>
        )}

        {err ? <p className="text-blush hand text-xl">{err}</p> : null}

        <button
          disabled={saving}
          onClick={save}
          className="w-full rounded-full bg-ink text-cream py-3 text-lg shadow-[3px_4px_0_0_rgba(74,64,56,0.25)] transition-transform hover:-translate-y-0.5 disabled:opacity-40"
        >
          {saving ? (
            <span className="inline-flex items-center gap-2">
              <span className="inline-block animate-spin">✿</span> taping it all together…
            </span>
          ) : mode === "edit" ? (
            "save changes →"
          ) : (
            "save & get a share link →"
          )}
        </button>
      </div>

      {/* ---- center: the page ---- */}
      <div ref={stageRef} className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 gap-4 overflow-auto">
        <div
          className="relative shadow-[6px_10px_30px_rgba(74,64,56,0.25)] rounded-[4px]"
          style={{ width: ew, height: eh, isolation: "isolate", backgroundColor: "#f7efdd", backgroundImage: "url(/paper.png)", backgroundSize: "360px", overflow: "hidden" }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelId(null);
          }}
        >
          {/* bottom margin line */}
          <div className="absolute left-[7%] right-[7%]" style={{ bottom: "12%", borderTop: "1.5px dashed rgba(74,64,56,0.18)" }} />

          {/* blank-page hello */}
          {els.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none opacity-60">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/doodles/sparkles.png" alt="" className="w-16 h-auto mb-2" />
              <p className="hand text-2xl text-ink-soft leading-snug">
                your blank page awaits…
                <br />
                tape something in ✿
              </p>
            </div>
          ) : null}

          {els
            .slice()
            .sort((a, b) => a.z - b.z)
            .map((el) => (
              <EditorElement
                key={el.id}
                el={el}
                selected={el.id === selId}
                onSelect={() => setSelId(el.id)}
                onEditText={(text) => updateEl(el.id, { text })}
                setRef={(node) => {
                  elRefs.current[el.id] = node;
                }}
                px={{ x: pxX(el), y: pxY(el), w: pxW(el) }}
                ew={ew}
              />
            ))}

          {/* moveable for the selected element (hidden while the success card is up
              so its handles don't paint over the modal) */}
          {target && selected && !result ? (
            <Moveable
              target={target}
              draggable
              resizable
              rotatable
              keepRatio={selected.type !== "text"}
              throttleDrag={0}
              throttleResize={0}
              throttleRotate={0}
              origin={false}
              onDragStart={(e) => {
                frames.current[selected.id] = { tx: pxX(selected), ty: pxY(selected), rot: selected.rot };
                e.set([frames.current[selected.id].tx, frames.current[selected.id].ty]);
              }}
              onDrag={(e) => {
                const f = frames.current[selected.id];
                f.tx = e.beforeTranslate[0];
                f.ty = e.beforeTranslate[1];
                e.target.style.transform = `translate(${f.tx}px, ${f.ty}px) rotate(${f.rot}deg)`;
              }}
              onDragEnd={() => {
                const f = frames.current[selected.id];
                updateEl(selected.id, { x: (f.tx / ew) * 100, y: (f.ty / eh) * 100 });
              }}
              onResizeStart={(e) => {
                frames.current[selected.id] = { tx: pxX(selected), ty: pxY(selected), rot: selected.rot };
                e.setOrigin(["%", "%"]);
                if (e.dragStart) e.dragStart.set([frames.current[selected.id].tx, frames.current[selected.id].ty]);
              }}
              onResize={(e) => {
                const f = frames.current[selected.id];
                if (e.drag) {
                  f.tx = e.drag.beforeTranslate[0];
                  f.ty = e.drag.beforeTranslate[1];
                }
                e.target.style.width = `${e.width}px`;
                e.target.style.transform = `translate(${f.tx}px, ${f.ty}px) rotate(${f.rot}deg)`;
                (e.target as HTMLElement).dataset.w = String(e.width);
              }}
              onResizeEnd={(e) => {
                const f = frames.current[selected.id];
                const w = Number((e.target as HTMLElement).dataset.w || pxW(selected));
                updateEl(selected.id, { w: (w / ew) * 100, x: (f.tx / ew) * 100, y: (f.ty / eh) * 100 });
              }}
              onRotateStart={(e) => {
                frames.current[selected.id] = { tx: pxX(selected), ty: pxY(selected), rot: selected.rot };
                e.set(selected.rot);
              }}
              onRotate={(e) => {
                const f = frames.current[selected.id];
                f.rot = e.beforeRotate;
                e.target.style.transform = `translate(${f.tx}px, ${f.ty}px) rotate(${f.rot}deg)`;
              }}
              onRotateEnd={() => {
                const f = frames.current[selected.id];
                updateEl(selected.id, { rot: f.rot });
              }}
            />
          ) : null}
        </div>

        {/* page nav */}
        <div className="flex items-center gap-4 hand text-2xl text-ink">
          <button onClick={() => setCur((c) => Math.max(0, c - 1))} disabled={cur === 0} className="disabled:opacity-30 px-2">
            ‹
          </button>
          <span>
            page {cur + 1} / {pages.length}
          </span>
          <button onClick={() => setCur((c) => Math.min(pages.length - 1, c + 1))} disabled={cur === pages.length - 1} className="disabled:opacity-30 px-2">
            ›
          </button>
          {pages.length > 1 ? (
            <button onClick={deletePage} className="text-ink-soft hover:text-blush text-base ml-2">
              remove page
            </button>
          ) : null}
        </div>
      </div>

      {result ? (
        <SavedCard id={result.id} editToken={result.editToken} edited={mode === "edit"} onClose={() => setResult(null)} />
      ) : null}
    </div>
  );
}

function ToolBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl border-2 border-dashed border-ink/25 hover:border-blush hover:bg-blush/5 transition-colors py-3 hand text-lg text-ink"
    >
      {label}
    </button>
  );
}

function EditorElement({
  el,
  selected,
  onSelect,
  onEditText,
  setRef,
  px,
  ew,
}: {
  el: El;
  selected: boolean;
  onSelect: () => void;
  onEditText: (text: string) => void;
  setRef: (node: HTMLElement | null) => void;
  px: { x: number; y: number; w: number };
  ew: number;
}) {
  const common = {
    ref: setRef as React.Ref<HTMLDivElement>,
    onMouseDown: onSelect,
    style: {
      position: "absolute" as const,
      left: 0,
      top: 0,
      width: px.w,
      transform: `translate(${px.x}px, ${px.y}px) rotate(${el.rot}deg)`,
      cursor: "move",
      touchAction: "none" as const,
      outline: selected ? "2px solid rgba(233,166,176,0.9)" : "none",
      outlineOffset: 2,
    },
  };

  if (el.type === "photo") {
    // bare = raw image, no white polaroid frame (toggled per-photo in the panel)
    if (el.bare) {
      return (
        <div {...common}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={el.src} alt="" draggable={false} style={{ width: "100%", height: "auto", display: "block", borderRadius: 2 }} />
        </div>
      );
    }
    return (
      <div {...common}>
        <div style={{ background: "#fffdf8", padding: "5% 5% 12% 5%", borderRadius: 3, boxShadow: "3px 5px 12px rgba(74,64,56,0.18)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={el.src} alt="" draggable={false} style={{ width: "100%", height: "auto", display: "block", borderRadius: 2 }} />
        </div>
      </div>
    );
  }
  if (el.type === "doodle") {
    return (
      <div {...common}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={el.src} alt="" draggable={false} style={{ width: "100%", height: "auto", display: "block" }} />
      </div>
    );
  }
  // text — double click to edit
  return (
    <div
      {...common}
      onDoubleClick={() => {
        const t = window.prompt("edit text", el.text);
        if (t !== null) onEditText(t);
      }}
      style={{
        ...common.style,
        fontSize: (el.size / 100) * ew,
        ...textCss(el.font, el.color),
      }}
    >
      <TextContent text={el.text} style={el.font} color={el.color} />
    </div>
  );
}

function SelectedControls({
  el,
  onDelete,
  onFront,
  onBack,
  onChange,
}: {
  el: El;
  onDelete: () => void;
  onFront: () => void;
  onBack: () => void;
  onChange: (patch: Partial<El>) => void;
}) {
  return (
    <div className="rounded-2xl bg-[#fffdf8]/70 border border-ink/10 p-3 space-y-3">
      <div className="flex gap-2">
        <MiniBtn onClick={onFront} label="bring front" />
        <MiniBtn onClick={onBack} label="send back" />
        <button onClick={onDelete} className="ml-auto text-blush hover:underline text-sm">
          delete
        </button>
      </div>

      {el.type === "photo" ? (
        <label className="flex items-center gap-2 text-base text-ink cursor-pointer select-none">
          <input
            type="checkbox"
            checked={!(el as PhotoEl).bare}
            onChange={(e) => onChange({ bare: !e.target.checked })}
            className="w-4 h-4 accent-blush"
          />
          polaroid frame
        </label>
      ) : null}

      {el.type === "text" ? (
        <>
          <textarea
            value={(el as TextEl).text}
            onChange={(e) => onChange({ text: e.target.value })}
            rows={2}
            className="w-full bg-cream border border-ink/15 rounded-lg p-2 hand text-lg text-ink outline-none focus:border-blush"
          />
          {/* writing style */}
          <div className="grid grid-cols-3 gap-1">
            {TEXT_STYLES.map((s) => (
              <button
                key={s.key}
                onClick={() => onChange({ font: s.key })}
                className={`rounded-lg px-2 py-1.5 text-sm border transition-colors ${
                  (el as TextEl).font === s.key
                    ? "bg-ink text-cream border-ink"
                    : "border-ink/20 text-ink hover:border-blush"
                }`}
                style={{ fontFamily: s.preview }}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-ink-soft mr-auto">size</span>
            <button onClick={() => onChange({ size: Math.max(3, (el as TextEl).size - 1) })} className="rounded-lg border border-ink/20 px-2">
              A−
            </button>
            <button onClick={() => onChange({ size: Math.min(20, (el as TextEl).size + 1) })} className="rounded-lg border border-ink/20 px-2">
              A+
            </button>
          </div>
          <div className="flex gap-2">
            {TEXT_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => onChange({ color: c })}
                className="w-6 h-6 rounded-full border-2"
                style={{ background: c, borderColor: (el as TextEl).color === c ? "#4a4038" : "transparent" }}
                aria-label="text color"
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function MiniBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className="rounded-lg border border-ink/20 hover:border-blush px-2 py-1 text-sm text-ink">
      {label}
    </button>
  );
}

function SavedCard({ id, editToken, edited, onClose }: { id: string; editToken: string; edited: boolean; onClose: () => void }) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = `${origin}/s/${id}`;
  const editUrl = `${origin}/s/${id}/edit?token=${editToken}`;
  return (
    <div className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm flex items-center justify-center p-6" onClick={onClose}>
      <div className="relative bg-cream max-w-md w-full rounded-3xl p-8 shadow-2xl text-center border border-ink/10" onClick={(e) => e.stopPropagation()}>
        <HeartsBurst />
        <button
          onClick={onClose}
          aria-label="close"
          className="absolute top-3 right-4 text-ink-soft hover:text-ink text-2xl leading-none"
        >
          ✕
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/doodles/heart.png" alt="" className="w-16 h-auto mx-auto mb-2" />
        <h3 className="hand text-4xl text-ink mb-2">{edited ? "saved!" : "it's ready!"}</h3>
        <p className="text-ink-soft mb-6">{edited ? "your changes are live ♡" : "share this link with someone you love ♡"}</p>
        <LinkRow label="share link" url={shareUrl} />
        {!edited ? <LinkRow label="secret edit link — keep this to yourself" url={editUrl} hint="bookmark it! it's the only way back to edit." /> : null}
        <Link href={`/s/${id}`} className="inline-block mt-6 rounded-full bg-ink text-cream px-8 py-3 text-lg shadow-[3px_4px_0_0_rgba(74,64,56,0.25)] hover:-translate-y-0.5 transition-transform">
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
        <input readOnly value={url} onFocus={(e) => e.currentTarget.select()} className="flex-1 min-w-0 bg-[#fffdf8] border border-ink/15 rounded-lg px-3 py-2 text-sm text-ink-soft" />
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
