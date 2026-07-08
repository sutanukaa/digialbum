"use client";

import type { CSSProperties } from "react";

// A handful of petals/hearts drift down slowly, staggered, very subtle.
const PETALS = [
  { left: "7%", char: "🌸", dur: 15, delay: 0, sx: "34px", sr: "160deg", cls: "text-xl" },
  { left: "22%", char: "♡", dur: 19, delay: 6, sx: "-26px", sr: "-140deg", cls: "text-lg text-blush" },
  { left: "44%", char: "✿", dur: 17, delay: 11, sx: "22px", sr: "200deg", cls: "text-lg text-sage" },
  { left: "68%", char: "🌸", dur: 21, delay: 3, sx: "-30px", sr: "-180deg", cls: "text-base" },
  { left: "84%", char: "♡", dur: 16, delay: 9, sx: "28px", sr: "150deg", cls: "text-lg text-blush" },
  { left: "58%", char: "❀", dur: 23, delay: 14, sx: "-20px", sr: "170deg", cls: "text-base text-ink-soft" },
];

export function PetalDrift() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {PETALS.map((p, i) => (
        <span
          key={i}
          className={`absolute top-0 select-none ${p.cls}`}
          style={
            {
              left: p.left,
              "--sx": p.sx,
              "--sr": p.sr,
              animation: `fall ${p.dur}s linear ${p.delay}s infinite`,
            } as CSSProperties
          }
        >
          {p.char}
        </span>
      ))}
    </div>
  );
}
