// Page-based scrapbook model. Elements are positioned in PERCENT of the page
// (x,y = top-left; w = width; for photos/doodles height follows the image's
// aspect; for text, size = font size as % of page width). This keeps the editor
// and the flip-view identical at any pixel size.

export type ElType = "photo" | "doodle" | "text";

export interface BaseEl {
  id: string;
  type: ElType;
  x: number; // % of page width
  y: number; // % of page height
  w: number; // % of page width
  rot: number; // degrees
  z: number; // stacking order
}
export interface PhotoEl extends BaseEl {
  type: "photo";
  src?: string; // existing URL
  upload?: number; // index into the uploaded files (new photos, save-time only)
  bare?: boolean; // render without the white polaroid frame (e.g. sitting inside a doodle frame)
}
export interface DoodleEl extends BaseEl {
  type: "doodle";
  src: string;
}
// writing styles for text elements ("hand"/"body" kept for older scrapbooks)
export type TextStyle =
  | "hand"
  | "body"
  | "neat"
  | "cursive"
  | "bubble"
  | "typewriter"
  | "marker"
  | "cutout";

export interface TextEl extends BaseEl {
  type: "text";
  text: string;
  font: TextStyle;
  size: number; // % of page width
  color: string;
}
export type El = PhotoEl | DoodleEl | TextEl;
export interface Page {
  elements: El[];
}
export interface ScrapData {
  pages: Page[];
}

// portrait page ratio (3:4)
export const PAGE_W = 600;
export const PAGE_H = 800;
export const PAGE_RATIO = PAGE_H / PAGE_W;

// bottom margin line sits this far up from the bottom (like a real notebook page)
export const MARGIN_PCT = 12;

export const DOODLE_TRAY = [
  // hearts & love
  "/doodles/heart.png",
  "/doodles/fingerprint-heart.png",
  "/doodles/van-gogh-heart.png",
  "/doodles/kiss-print.png",
  "/doodles/love-letter.png",
  // bows & cute
  "/doodles/bow.png",
  "/doodles/checked-bow.png",
  "/doodles/cherries.png",
  "/doodles/teddy.png",
  "/doodles/black-cat.png",
  "/doodles/flower-cat.png",
  "/doodles/wombat.png",
  "/doodles/mirrorball.png",
  "/doodles/evil-eye.png",
  // stars & sparkle
  "/doodles/star.png",
  "/doodles/red-stars.png",
  "/doodles/sparkles.png",
  "/doodles/11-11.png",
  "/doodles/arrow.png",
  "/doodles/cloud.png",
  "/doodles/butterfly.png",
  // florals
  "/doodles/flower.png",
  "/doodles/flower2.png",
  "/doodles/flower3.png",
  "/doodles/lilly.png",
  "/doodles/tulip-boquet.png",
  "/doodles/sunflowers.png",
  "/doodles/sprig.png",
  "/doodles/leaves.png",
  // word stickers
  "/doodles/forever-n-always.png",
  "/doodles/ps-i-love-you.png",
  "/doodles/favourite-person.png",
  "/doodles/my-girl.png",
  "/doodles/pretty-boy.png",
  "/doodles/my-sunshine.png",
  "/doodles/main-character.png",
  "/doodles/quote1.png",
  "/doodles/quote2.png",
  "/doodles/quote3.png",
  "/doodles/quote-4.png",
  // frames, banners & paper bits
  "/doodles/banner.png",
  "/doodles/frame-rect.png",
  "/doodles/frame-oval.png",
  "/doodles/corner-floral.png",
  "/doodles/garland.png",
  "/doodles/divider.png",
  "/doodles/sticky-note.png",
  "/doodles/paper-with-paper-clip.png",
  // tape & clip
  "/tape1.png",
  "/tape2.png",
  "/tape3.png",
  "/paperclip.png",
];

export const TEXT_COLORS = ["#4a4038", "#e9a6b0", "#9bb89a", "#a9c4d6", "#caa6e0"];

// Normalize whatever is stored into pages[]. Old scrapbooks used
// data.items = [{src, caption}] with no positions — lay them out into one page.
export function toPages(data: unknown): Page[] {
  const d = (data ?? {}) as { pages?: Page[]; items?: { src: string; caption?: string }[] };
  if (d.pages && d.pages.length) return d.pages;

  const items = d.items ?? [];
  const els: El[] = [];
  items.forEach((it, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 8 + col * 46;
    const y = 5 + row * 30;
    els.push({ id: `p${i}`, type: "photo", src: it.src, x, y, w: 38, rot: i % 2 ? 3 : -3, z: i * 2 });
    if (it.caption) {
      els.push({
        id: `c${i}`,
        type: "text",
        text: it.caption,
        x,
        y: y + 24,
        w: 38,
        rot: 0,
        z: i * 2 + 1,
        font: "hand",
        size: 5,
        color: "#4a4038",
      });
    }
  });
  return [{ elements: els }];
}

export function emptyPage(): Page {
  return { elements: [] };
}
