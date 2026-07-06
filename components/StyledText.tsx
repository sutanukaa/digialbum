import type { CSSProperties } from "react";
import type { TextStyle } from "@/lib/scrapbook";

// One place that knows how each writing style looks. Both the editor canvas and
// the read-only PageCanvas call textCss()/TextContent() so styles stay identical.

const FONT: Record<string, string> = {
  hand: "var(--font-hand), cursive", // legacy
  body: "var(--font-body), sans-serif", // legacy
  neat: "var(--font-body), cursive",
  cursive: "var(--font-cursive), cursive",
  bubble: "var(--font-bubble), cursive",
  typewriter: "var(--font-typewriter), monospace",
  marker: "var(--font-marker), cursive",
  cutout: "var(--font-cutout), sans-serif",
};

// pickable styles for the editor panel (legacy hand/body intentionally hidden)
export const TEXT_STYLES: { key: TextStyle; label: string; preview: string }[] = [
  { key: "neat", label: "neat", preview: FONT.neat },
  { key: "cursive", label: "cursive", preview: FONT.cursive },
  { key: "bubble", label: "bubble", preview: FONT.bubble },
  { key: "typewriter", label: "typwrtr", preview: FONT.typewriter },
  { key: "marker", label: "marker", preview: FONT.marker },
  { key: "cutout", label: "cut-out", preview: FONT.cutout },
];

// font + colour + effect for a text style. Positioning stays with the caller.
export function textCss(style: string, color: string): CSSProperties {
  const css: CSSProperties = {
    fontFamily: FONT[style] ?? FONT.neat,
    color,
    lineHeight: 1.15,
    textAlign: "center",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  };

  if (style === "bubble") {
    // proper balloon letters: puffy font, ink outline, soft pop — em-based so it
    // scales at any page size. color drives the fill.
    css.WebkitTextStrokeWidth = "0.05em";
    css.WebkitTextStrokeColor = "#4a4038";
    css.paintOrder = "stroke fill";
    css.textShadow = "0.03em 0.05em 0 rgba(74,64,56,0.22)";
  } else if (style === "marker") {
    css.textShadow = "0.008em 0.01em 0 rgba(0,0,0,0.06)";
  } else if (style === "cutout") {
    // per-letter boxes carry the colour; keep the container neutral
    css.color = "#3a2f28";
  }
  return css;
}

// deterministic (no Math.random → no hydration mismatch) magazine cut-out boxes
type RGB = [number, number, number];
function hexToRgb(hex: string): RGB {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
}
const mixRgb = (a: RGB, b: RGB, t: number): RGB =>
  [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * t)) as RGB;
const lum = ([r, g, b]: RGB) => (0.299 * r + 0.587 * g + 0.114 * b) / 255;

export function TextContent({ text, style, color }: { text: string; style: string; color: string }) {
  if (style !== "cutout") return <>{text}</>;

  const base = hexToRgb(color || "#4a4038");
  // four shades of the chosen colour + an ink accent, for ransom-note variety
  const shades: RGB[] = [
    base,
    mixRgb(base, [255, 255, 255], 0.42),
    mixRgb(base, [0, 0, 0], 0.22),
    mixRgb(base, [255, 255, 255], 0.16),
    [74, 64, 56],
  ];

  return (
    <>
      {Array.from(text).map((ch, i) => {
        if (ch === " ") return <span key={i}>{" "}</span>;
        const rot = ((i * 41) % 9) - 4; // -4..4
        const shade = shades[i % shades.length];
        const fg = lum(shade) < 0.55 ? "#f7efdd" : "#3a2f28"; // contrast per box
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              transform: `rotate(${rot}deg)`,
              background: `rgb(${shade[0]}, ${shade[1]}, ${shade[2]})`,
              color: fg,
              padding: "0 0.09em",
              margin: "0.06em 0.03em",
              borderRadius: 2,
              boxShadow: "0.02em 0.03em 0 rgba(74,64,56,0.18)",
            }}
          >
            {ch}
          </span>
        );
      })}
    </>
  );
}
