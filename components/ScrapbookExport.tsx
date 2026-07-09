"use client";

import { useRef, useState } from "react";
import { toCanvas } from "html-to-image";
import { jsPDF } from "jspdf";
import { PageSheet } from "./PageCanvas";
import { PAGE_RATIO, type Page } from "@/lib/scrapbook";

// full-res render size used only for capture (crisp exports)
const EW = 820;
const EH = Math.round(EW * PAGE_RATIO);

function slug(title: string) {
  const s = (title || "").replace(/[^a-z0-9 _-]/gi, "").trim().replace(/\s+/g, "-").toLowerCase();
  return s || "scrapbook";
}

function download(url: string, name: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
}

export function ScrapbookExport({ pages, title }: { pages: Page[]; title: string }) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const [busy, setBusy] = useState<null | "png" | "pdf">(null);
  const [err, setErr] = useState("");

  async function capture(): Promise<HTMLCanvasElement[]> {
    const out: HTMLCanvasElement[] = [];
    for (let i = 0; i < pages.length; i++) {
      const node = refs.current[i];
      if (!node) continue;
      // eslint-disable-next-line no-await-in-loop
      out.push(await toCanvas(node, { pixelRatio: 2, cacheBust: true, backgroundColor: "#f7efdd" }));
    }
    return out;
  }

  async function exportPng() {
    setBusy("png");
    setErr("");
    try {
      const canvases = await capture();
      const name = slug(title);
      if (canvases.length === 1) {
        download(canvases[0].toDataURL("image/png"), `${name}.png`);
      } else {
        // one PNG per page, staggered so the browser doesn't drop rapid downloads
        for (let i = 0; i < canvases.length; i++) {
          download(canvases[i].toDataURL("image/png"), `${name}-page-${i + 1}.png`);
          // eslint-disable-next-line no-await-in-loop
          await new Promise((r) => setTimeout(r, 350));
        }
      }
    } catch {
      setErr("hmm, export failed — try again?");
    } finally {
      setBusy(null);
    }
  }

  async function exportPdf() {
    setBusy("pdf");
    setErr("");
    try {
      const canvases = await capture();
      const first = canvases[0];
      const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [first.width, first.height] });
      canvases.forEach((c, i) => {
        if (i > 0) pdf.addPage([c.width, c.height], "portrait");
        pdf.addImage(c.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, c.width, c.height);
      });
      pdf.save(`${slug(title)}.pdf`);
    } catch {
      setErr("hmm, export failed — try again?");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="hand text-2xl text-ink">keep a copy ♡</p>
      <div className="flex gap-3">
        <button
          onClick={exportPng}
          disabled={!!busy}
          className="rounded-full bg-ink text-cream px-6 py-2.5 shadow-[3px_4px_0_0_rgba(74,64,56,0.25)] hover:-translate-y-0.5 transition-transform disabled:opacity-40"
        >
          {busy === "png" ? "saving…" : "download image"}
        </button>
        <button
          onClick={exportPdf}
          disabled={!!busy}
          className="rounded-full border-2 border-ink/25 text-ink px-6 py-2.5 hover:border-blush hover:-translate-y-0.5 transition-all disabled:opacity-40"
        >
          {busy === "pdf" ? "saving…" : "download PDF"}
        </button>
      </div>
      {err ? <p className="text-blush text-sm">{err}</p> : null}

      {/* offscreen full-res render, captured on export */}
      <div style={{ position: "fixed", left: -99999, top: 0, opacity: 0, pointerEvents: "none" }} aria-hidden>
        {pages.map((p, i) => (
          <div
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
          >
            <PageSheet page={p} pw={EW} ph={EH} />
          </div>
        ))}
      </div>
    </div>
  );
}
