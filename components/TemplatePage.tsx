import { PAGE_RATIO } from "@/lib/scrapbook";
import type { TemplateDef } from "@/lib/templates";
import { textCss, TextContent } from "@/components/StyledText";

// Renders a template page at a fixed pixel width. Layers bottom→top:
//   decor (doodles) → photo slots → text.
// `images[i]` fills slot i; `texts[k]` overrides text k. `onSlotClick`/`onTextClick`
// make them interactive (editor); omit for a static thumbnail.
export function TemplatePage({
  template,
  pw,
  images = [],
  texts,
  onSlotClick,
  onTextClick,
}: {
  template: TemplateDef;
  pw: number;
  images?: (string | undefined)[];
  texts?: string[];
  onSlotClick?: (i: number) => void;
  onTextClick?: (k: number) => void;
}) {
  const ph = Math.round(pw * PAGE_RATIO);

  return (
    <div
      style={{
        position: "relative",
        isolation: "isolate", // contain the 1–500 element z-indexes so they can't
        // climb over modals/overlays outside this page
        width: pw,
        height: ph,
        backgroundColor: "#f7efdd",
        backgroundImage: "url(/paper.png)",
        backgroundSize: `${Math.round(pw * 0.85)}px`,
        overflow: "hidden",
        borderRadius: 4,
      }}
    >
      {/* bottom margin line */}
      <div style={{ position: "absolute", left: "7%", right: "7%", bottom: "12%", borderTop: "1.5px dashed rgba(74,64,56,0.18)" }} />

      {/* decor — underneath everything */}
      {template.decor.map((d, j) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`d${j}`}
          src={d.src}
          alt=""
          style={{
            position: "absolute",
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: `${d.w}%`,
            transform: `rotate(${d.rot}deg)`,
            transformOrigin: "center",
            pointerEvents: "none",
            zIndex: d.top ? 300 + j : j,
          }}
        />
      ))}

      {/* photo slots */}
      {template.slots.map((s, i) => {
        const img = images[i];
        const bare = s.fit === "bare";
        const content = img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt="" style={{ width: "100%", height: "auto", display: "block", borderRadius: 2 }} />
        ) : (
          <div
            style={{
              aspectRatio: "4 / 5",
              borderRadius: 2,
              border: "2px dashed rgba(74,64,56,0.28)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(74,64,56,0.04)",
            }}
          >
            <span style={{ fontFamily: "var(--font-hand), cursive", fontSize: pw * 0.11, color: "rgba(74,64,56,0.45)", lineHeight: 1 }}>
              {i + 1}
            </span>
          </div>
        );

        return (
          <div
            key={`s${i}`}
            onClick={onSlotClick ? () => onSlotClick(i) : undefined}
            style={{
              position: "absolute",
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: `${s.w}%`,
              transform: `rotate(${s.rot}deg)`,
              transformOrigin: "center",
              zIndex: 100 + i,
              cursor: onSlotClick ? "pointer" : "default",
            }}
          >
            {bare ? (
              content
            ) : (
              <div style={{ background: "#fffdf8", padding: "5% 5% 12% 5%", borderRadius: 3, boxShadow: "3px 5px 12px rgba(74,64,56,0.18)" }}>
                {content}
              </div>
            )}
          </div>
        );
      })}

      {/* text — on top of everything */}
      {template.texts.map((t, k) => {
        const raw = texts ? texts[k] : t.text;
        const empty = raw === undefined || raw === "";
        const shown = empty ? t.text : raw;
        return (
          <div
            key={`t${k}`}
            onClick={onTextClick ? () => onTextClick(k) : undefined}
            style={{
              position: "absolute",
              left: `${t.x}%`,
              top: `${t.y}%`,
              width: `${t.w}%`,
              transform: `rotate(${t.rot}deg)`,
              transformOrigin: "center",
              zIndex: 500 + k,
              fontSize: (t.size / 100) * pw,
              textAlign: t.align ?? "center",
              opacity: empty && onTextClick ? 0.35 : 1,
              cursor: onTextClick ? "text" : "default",
              ...textCss(t.font, t.color),
            }}
          >
            <TextContent text={shown} style={t.font} color={t.color} />
          </div>
        );
      })}
    </div>
  );
}
