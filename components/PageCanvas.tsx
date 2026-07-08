import type { CSSProperties } from "react";
import { MARGIN_PCT, type El, type Page } from "@/lib/scrapbook";
import { textCss, TextContent } from "@/components/StyledText";

// Render one element read-only. `pw` = page width in px (needed for font sizing).
export function renderElement(el: El, pw: number) {
  const base: CSSProperties = {
    position: "absolute",
    left: `${el.x}%`,
    top: `${el.y}%`,
    width: `${el.w}%`,
    transform: `rotate(${el.rot}deg)`,
    transformOrigin: "center",
    zIndex: el.z,
  };

  if (el.type === "photo") {
    // bare = just the image (sits inside a frame doodle); otherwise a polaroid
    if (el.bare) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={el.id} src={el.src} alt="" style={{ ...base, height: "auto", display: "block", borderRadius: 2 }} />
      );
    }
    return (
      <div key={el.id} style={base}>
        <div
          style={{
            background: "#fffdf8",
            padding: "5% 5% 12% 5%",
            borderRadius: 3,
            boxShadow: "3px 5px 12px rgba(74,64,56,0.18)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={el.src}
            alt=""
            style={{ width: "100%", height: "auto", display: "block", borderRadius: 2 }}
          />
        </div>
      </div>
    );
  }

  if (el.type === "doodle") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        key={el.id}
        src={el.src}
        alt=""
        style={{ ...base, height: "auto", filter: "drop-shadow(1px 2px 2px rgba(74,64,56,0.12))" }}
      />
    );
  }

  // text
  return (
    <div key={el.id} style={{ ...base, fontSize: (el.size / 100) * pw, ...textCss(el.font, el.color) }}>
      <TextContent text={el.text} style={el.font} color={el.color} />
    </div>
  );
}

// A full notebook page sheet at a fixed pixel size.
export function PageSheet({ page, pw, ph }: { page: Page; pw: number; ph: number }) {
  return (
    <div
      style={{
        position: "relative",
        width: pw,
        height: ph,
        backgroundColor: "#f7efdd",
        backgroundImage: "url(/paper.png)",
        backgroundSize: "360px",
        overflow: "hidden",
      }}
    >
      {/* bottom margin line, like a real notebook page */}
      <div
        style={{
          position: "absolute",
          left: "7%",
          right: "7%",
          bottom: `${MARGIN_PCT}%`,
          borderTop: "1.5px dashed rgba(74,64,56,0.18)",
        }}
      />
      {page.elements.map((el) => renderElement(el, pw))}
    </div>
  );
}
