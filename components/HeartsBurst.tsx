"use client";

import type { CSSProperties } from "react";

// A little puff of hearts that flies outward once (drop it in a relative parent).
export function HeartsBurst() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible" aria-hidden>
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        const dist = 70 + (i % 3) * 34;
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist - 24;
        const dr = (i % 2 ? 1 : -1) * (16 + i * 4);
        const style = {
          "--dx": `${dx.toFixed(0)}px`,
          "--dy": `${dy.toFixed(0)}px`,
          "--dr": `${dr}deg`,
          animation: `heart-fly 1.1s ease-out ${(i * 0.02).toFixed(2)}s forwards`,
        } as CSSProperties;
        return (
          <span
            key={i}
            className={i % 4 === 0 ? "absolute text-2xl" : "absolute text-xl text-blush"}
            style={style}
          >
            {i % 4 === 0 ? "🤍" : "♡"}
          </span>
        );
      })}
    </div>
  );
}
