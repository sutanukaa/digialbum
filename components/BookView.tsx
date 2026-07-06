"use client";

import { useEffect, useState } from "react";
import { PageSheet } from "./PageCanvas";
import { PAGE_RATIO, emptyPage, type Page } from "@/lib/scrapbook";

const PW = 420;
const PH = Math.round(PW * PAGE_RATIO);
const FLIP_MS = 700;

// Open-book flip, hand-rolled in CSS 3D (no library). Pages are grouped into
// leaves; leaf i shows pages[2i] on its front and pages[2i+1] on its back, and
// rotates around the center spine. `flipped` = how many leaves are turned left.
export default function BookView({ pages }: { pages: Page[] }) {
  const [flipped, setFlipped] = useState(0);
  const [animating, setAnimating] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const leaves = Math.ceil(pages.length / 2);
  const front = (i: number) => pages[2 * i] ?? emptyPage();
  const back = (i: number) => pages[2 * i + 1] ?? emptyPage();

  function turn(dir: 1 | -1) {
    const leaf = dir === 1 ? flipped : flipped - 1;
    if (leaf < 0 || leaf >= leaves) return;
    setAnimating(leaf);
    setFlipped((f) => f + dir);
    window.setTimeout(() => setAnimating(null), FLIP_MS);
  }

  // static fallback (no-JS / pre-mount): just stack the pages
  if (!mounted) {
    return (
      <div className="flex flex-col items-center gap-8 py-10">
        {pages.map((p, i) => (
          <div key={i} className="shadow-md rounded-[3px] overflow-hidden">
            <PageSheet page={p} pw={PW} ph={PH} />
          </div>
        ))}
      </div>
    );
  }

  const zIndex = (i: number) => {
    if (animating === i) return 999; // the turning leaf rides on top through the sweep
    return i < flipped ? i : leaves - i;
  };

  return (
    <div className="flex flex-col items-center gap-5 py-10">
      <div className="overflow-x-auto max-w-full px-2">
        <div
          className="relative mx-auto"
          style={{ width: 2 * PW, height: PH, perspective: 2200 }}
        >
          {/* the two resting halves of the book, underneath the leaves */}
          <div className="absolute top-0 left-0 shadow-[inset_-14px_0_24px_-16px_rgba(74,64,56,0.5)]" style={{ width: PW, height: PH }}>
            <PageSheet page={emptyPage()} pw={PW} ph={PH} />
          </div>
          <div className="absolute top-0 shadow-[inset_14px_0_24px_-16px_rgba(74,64,56,0.5)]" style={{ left: PW, width: PW, height: PH }}>
            <PageSheet page={emptyPage()} pw={PW} ph={PH} />
          </div>

          {/* leaves */}
          {Array.from({ length: leaves }, (_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: 0,
                left: PW,
                width: PW,
                height: PH,
                transformStyle: "preserve-3d",
                transformOrigin: "left center",
                transform: `rotateY(${i < flipped ? -180 : 0}deg)`,
                transition: `transform ${FLIP_MS}ms cubic-bezier(0.3,0.1,0.2,1)`,
                zIndex: zIndex(i),
              }}
            >
              {/* front = right-hand page */}
              <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden" }}>
                <PageLeaf page={front(i)} num={2 * i + 1} onClick={() => turn(1)} side="right" />
              </div>
              {/* back = the next left-hand page (revealed once turned) */}
              <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                <PageLeaf page={back(i)} num={2 * i + 2} onClick={() => turn(-1)} side="left" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* controls */}
      <div className="flex items-center gap-6 hand text-3xl text-ink select-none">
        <button onClick={() => turn(-1)} disabled={flipped === 0} className="disabled:opacity-25 hover:-translate-x-0.5 transition-transform">
          ‹
        </button>
        <span className="text-xl text-ink-soft">turn the page</span>
        <button onClick={() => turn(1)} disabled={flipped >= leaves} className="disabled:opacity-25 hover:translate-x-0.5 transition-transform">
          ›
        </button>
      </div>
    </div>
  );
}

function PageLeaf({ page, num, onClick, side }: { page: Page; num: number; onClick: () => void; side: "left" | "right" }) {
  return (
    <div
      onClick={onClick}
      className="relative cursor-pointer"
      style={{
        boxShadow:
          side === "right"
            ? "inset 18px 0 26px -18px rgba(74,64,56,0.45)"
            : "inset -18px 0 26px -18px rgba(74,64,56,0.45)",
      }}
    >
      <PageSheet page={page} pw={PW} ph={PH} />
      <span className="hand text-ink-soft text-lg absolute bottom-2" style={{ [side === "right" ? "right" : "left"]: 16 } as React.CSSProperties}>
        {num}
      </span>
    </div>
  );
}
