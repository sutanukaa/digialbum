"use client";

import { memo, useEffect, useMemo, useState } from "react";
import { PageSheet } from "./PageCanvas";
import { PAGE_RATIO, emptyPage, type Page } from "@/lib/scrapbook";
import { playPageTurn } from "@/lib/sound";

const PW = 460;
const PH = Math.round(PW * PAGE_RATIO);
const FLIP_MS = 700;

// memoized: the image-heavy page paints once; a turn only re-renders the thin
// wrappers (transform + z), so nothing re-paints mid-animation.
const MemoSheet = memo(PageSheet);

const RING = "0 0 0 1px rgba(74,64,56,0.2)";

// Single-page notebook: one page fills the frame and turns (around its left edge,
// like a page bound on the left) to reveal the next. `flipped` = current page index.
export default function BookView({ pages }: { pages: Page[] }) {
  const [flipped, setFlipped] = useState(0);
  const [animating, setAnimating] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    setMounted(true);
    const fit = () => setScale(Math.min(1, (window.innerWidth - 28) / PW));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const blank = useMemo(() => emptyPage(), []);
  const last = pages.length - 1;

  function turn(dir: 1 | -1) {
    const next = flipped + dir;
    if (next < 0 || next > last) return;
    playPageTurn();
    setAnimating(dir === 1 ? flipped : next); // the leaf that's toggling
    setFlipped(next);
    window.setTimeout(() => setAnimating(null), FLIP_MS);
  }

  // static fallback (no-JS / pre-mount): stack the pages
  if (!mounted) {
    return (
      <div className="flex flex-col items-center gap-8 py-10">
        {pages.map((p, i) => (
          <div key={i} className="shadow-md rounded-[3px] overflow-hidden">
            <MemoSheet page={p} pw={PW} ph={PH} />
          </div>
        ))}
      </div>
    );
  }

  const zIndex = (i: number) => {
    if (animating === i) return 999; // the turning page rides on top
    return i < flipped ? i : pages.length - i; // current (i===flipped) is highest
  };

  return (
    <div className="flex flex-col items-center gap-5 py-10 px-2">
      <div style={{ width: PW * scale, height: PH * scale }}>
        <div
          className="relative rounded-[4px]"
          style={{ width: PW, height: PH, perspective: 1900, transform: `scale(${scale})`, transformOrigin: "top left" }}
        >
          {pages.map((p, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: PW,
                height: PH,
                transformStyle: "preserve-3d",
                transformOrigin: "left center",
                transform: `rotateY(${i < flipped ? -180 : 0}deg)`,
                transition: `transform ${FLIP_MS}ms cubic-bezier(0.3, 0.1, 0.2, 1)`,
                zIndex: zIndex(i),
                willChange: "transform",
              }}
            >
              {/* front = the page */}
              <div
                onClick={() => turn(1)}
                className="page-front cursor-pointer"
                style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", boxShadow: `${RING}, 0 14px 34px -12px rgba(74,64,56,0.3)` }}
              >
                <MemoSheet page={p} pw={PW} ph={PH} />
                <span className="hand text-ink-soft text-lg absolute bottom-2 left-4">{i + 1}</span>
                <div className="page-corner" />
              </div>
              {/* back = blank paper (what you glimpse as it turns away) */}
              <div
                onClick={() => turn(-1)}
                className="cursor-pointer"
                style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)", boxShadow: RING }}
              >
                <MemoSheet page={blank} pw={PW} ph={PH} />
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
        <span className="text-xl text-ink-soft">
          page {flipped + 1} / {pages.length}
        </span>
        <button onClick={() => turn(1)} disabled={flipped >= last} className="disabled:opacity-25 hover:translate-x-0.5 transition-transform">
          ›
        </button>
      </div>
    </div>
  );
}
