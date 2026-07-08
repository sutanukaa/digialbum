import type { TextStyle } from "@/lib/scrapbook";

// Template definitions. A template is a fixed page layout of:
//   - SLOTS: numbered photo drop-zones (fit "polaroid" = white frame, "bare" = raw
//     image, e.g. to sit inside a frame doodle)
//   - TEXTS: editable words placed ON TOP of the page (title, caption…). The user
//     edits the WORDS; the style (font/size/colour) is fixed by the template.
//   - DECOR: fixed doodles (banners, frames, stickers…) rendered underneath.
//
// All coords are PERCENT of the page (x,y = top-left, w = width, rot = degrees).
// Density recipe: ~3 photos + ~10 stickers + ~3 editable texts, overlapping & tilted.

export type TemplateSlot = { x: number; y: number; w: number; rot: number; fit?: "polaroid" | "bare" };
export type TemplateText = {
  x: number;
  y: number;
  w: number;
  rot: number;
  text: string; // default wording — the user edits this, not the style
  font: TextStyle;
  size: number; // % of page width
  color: string;
  align?: "left" | "center" | "right";
};
export type TemplateDecor = { src: string; x: number; y: number; w: number; rot: number; top?: boolean };
// top: render this doodle ABOVE the photos (a sticker stuck on top), not behind them.
export type TemplateDef = {
  id: string;
  name: string;
  blurb: string;
  slots: TemplateSlot[];
  texts: TemplateText[];
  decor: TemplateDecor[];
};

const INK = "#4a4038";
const BLUSH = "#e9a6b0";
const SAGE = "#9bb89a";
const SKY = "#a9c4d6";
const RED = "#a23b30";

export const TEMPLATES: TemplateDef[] = [
  // 1 — couple, dense love-collage (approved showcase)
  {
    id: "you-and-me",
    name: "you & me",
    blurb: "a love-letter collage for your favourite person",
    texts: [
      { x: 30, y: 33, w: 34, rot: -2, text: "old soul <3", font: "hand", size: 5, color: BLUSH, align: "center" },
      { x: 61, y: 36, w: 28, rot: 3, text: "12 · 01 · 25", font: "typewriter", size: 3.5, color: INK, align: "center" },
      { x: 5, y: 93, w: 44, rot: 2, text: "my whole heart, always", font: "cursive", size: 5, color: INK, align: "center" },
    ],
    slots: [
      { x: 42, y: 15, w: 40, rot: 4 },
      { x: 25, y: 41, w: 36, rot: -3, fit: "bare" },
      { x: 9, y: 57, w: 38, rot: -5 },
    ],
    decor: [
      { src: "/doodles/kiss-print.png", x: 1, y: 2, w: 24, rot: -10 },
      { src: "/doodles/forever-n-always.png", x: 30, y: 2, w: 46, rot: -2 },
      { src: "/doodles/red-stars.png", x: 80, y: 4, w: 13, rot: 8 },
      { src: "/doodles/tulip-boquet.png", x: -3, y: 33, w: 26, rot: -6 },
      { src: "/doodles/van-gogh-heart.png", x: 87, y: 27, w: 11, rot: 12 },
      { src: "/doodles/love-letter.png", x: 66, y: 45, w: 30, rot: 9 },
      { src: "/doodles/heart.png", x: 49, y: 36, w: 7, rot: 0 },
      { src: "/doodles/fingerprint-heart.png", x: 45, y: 61, w: 9, rot: 6 },
      { src: "/doodles/heart.png", x: 85, y: 62, w: 7, rot: -10 },
      { src: "/doodles/favourite-person.png", x: 1, y: 43, w: 29, rot: -5 },
      { src: "/doodles/quote1.png", x: 60, y: 69, w: 34, rot: -4 },
      { src: "/doodles/teddy.png", x: -2, y: 82, w: 16, rot: -6 },
      { src: "/doodles/ps-i-love-you.png", x: 57, y: 84, w: 30, rot: 5 },
    ],
  },

  // 2 — best friends (photobooth-strip vibe on the left)
  {
    id: "best-friends",
    name: "best friends",
    blurb: "for your partner in crime",
    texts: [
      { x: 5, y: 4, w: 48, rot: -2, text: "best friends", font: "marker", size: 8, color: BLUSH, align: "left" },
      { x: 4, y: 63, w: 34, rot: 2, text: "partners in crime", font: "hand", size: 5, color: INK, align: "center" },
      { x: 54, y: 90, w: 40, rot: 1, text: "since day one", font: "typewriter", size: 3.5, color: INK, align: "center" },
    ],
    slots: [
      { x: 7, y: 15, w: 33, rot: -3 },
      { x: 8, y: 38, w: 33, rot: 2 },
      { x: 50, y: 46, w: 42, rot: 4, fit: "bare" },
    ],
    decor: [
      { src: "/doodles/main-character.png", x: 52, y: 8, w: 34, rot: 5 },
      { src: "/doodles/mirrorball.png", x: 74, y: 28, w: 21, rot: -6 },
      { src: "/doodles/checked-bow.png", x: 43, y: 30, w: 13, rot: -12 },
      { src: "/doodles/red-stars.png", x: 1, y: 60, w: 14, rot: -8 },
      { src: "/doodles/cherries.png", x: 60, y: 71, w: 16, rot: 8 },
      { src: "/doodles/sparkles.png", x: 44, y: 5, w: 13, rot: 0 },
      { src: "/doodles/star.png", x: 85, y: 62, w: 9, rot: 0 },
      { src: "/doodles/heart.png", x: 47, y: 44, w: 7, rot: 0 },
      { src: "/doodles/quote1.png", x: 48, y: 79, w: 34, rot: -3 },
      { src: "/doodles/black-cat.png", x: 30, y: 84, w: 15, rot: 4 },
    ],
  },

  // 3 — family (garland draped ON TOP, corner florals, sunshine sticker)
  {
    id: "our-family",
    name: "our family",
    blurb: "everyone under one little roof",
    texts: [
      { x: 24, y: 3, w: 52, rot: 0, text: "our family", font: "cursive", size: 9, color: SAGE, align: "center" },
      { x: 54, y: 24, w: 34, rot: 3, text: "all together now", font: "typewriter", size: 3.3, color: INK, align: "center" },
      { x: 12, y: 93, w: 76, rot: 0, text: "home is wherever we're together", font: "hand", size: 4.5, color: INK, align: "center" },
    ],
    slots: [
      { x: 13, y: 20, w: 33, rot: -4 },
      { x: 55, y: 19, w: 33, rot: 3 },
      { x: 14, y: 50, w: 33, rot: 4 },
      { x: 54, y: 51, w: 33, rot: -3 },
    ],
    decor: [
      { src: "/doodles/sunflowers.png", x: 1, y: 1, w: 16, rot: -4 },
      { src: "/doodles/corner-floral.png", x: 68, y: -2, w: 30, rot: 180 },
      { src: "/doodles/corner-floral.png", x: -3, y: 63, w: 32, rot: 0 },
      { src: "/doodles/flower2.png", x: 89, y: 46, w: 9, rot: 0 },
      { src: "/doodles/garland.png", x: 2, y: 39, w: 96, rot: 0, top: true },
      { src: "/doodles/my-sunshine.png", x: 1, y: 80, w: 30, rot: -3, top: true },
      { src: "/doodles/teddy.png", x: 43, y: 82, w: 15, rot: 4, top: true },
      { src: "/doodles/heart.png", x: 45, y: 44, w: 7, rot: 0, top: true },
      { src: "/doodles/heart.png", x: 85, y: 30, w: 6, rot: -8, top: true },
    ],
  },

  // 4 — adventures / travel (film-strip of 3 on the left)
  {
    id: "adventures",
    name: "adventures",
    blurb: "all the places you've been together",
    texts: [
      { x: 10, y: 2, w: 80, rot: -1, text: "our adventures", font: "cutout", size: 5, color: INK, align: "center" },
      { x: 12, y: 92, w: 76, rot: 0, text: "so many places, so many memories", font: "hand", size: 4.5, color: INK, align: "center" },
      { x: 56, y: 42, w: 32, rot: 4, text: "wish you were here", font: "marker", size: 4.5, color: SKY, align: "center" },
    ],
    slots: [
      { x: 6, y: 13, w: 30, rot: -2 },
      { x: 7, y: 35, w: 30, rot: 1 },
      { x: 8, y: 57, w: 30, rot: -2 },
      { x: 50, y: 16, w: 40, rot: 4, fit: "bare" },
      { x: 48, y: 52, w: 40, rot: -3 },
    ],
    decor: [
      { src: "/doodles/cloud.png", x: 40, y: 3, w: 20, rot: 0 },
      { src: "/doodles/cloud.png", x: 80, y: 9, w: 15, rot: 0 },
      { src: "/doodles/11-11.png", x: 62, y: 70, w: 22, rot: -4 },
      { src: "/doodles/arrow.png", x: 42, y: 40, w: 14, rot: 12 },
      { src: "/doodles/van-gogh-heart.png", x: 86, y: 40, w: 11, rot: 10 },
      { src: "/doodles/red-stars.png", x: 84, y: 62, w: 12, rot: 0 },
      { src: "/doodles/sparkles.png", x: 43, y: 9, w: 12, rot: 0 },
      { src: "/doodles/star.png", x: 41, y: 66, w: 9, rot: 0 },
    ],
  },

  // 5 — birthday (disco, cherries, gingham, sparkle)
  {
    id: "happy-birthday",
    name: "happy birthday",
    blurb: "make their day extra sweet",
    texts: [
      { x: 10, y: 4, w: 80, rot: -1, text: "happy birthday!", font: "bubble", size: 8, color: BLUSH, align: "center" },
      { x: 16, y: 91, w: 68, rot: 1, text: "another year of you", font: "cursive", size: 5, color: INK, align: "center" },
      { x: 58, y: 40, w: 34, rot: 3, text: "make a wish ♡", font: "marker", size: 4.5, color: RED, align: "center" },
    ],
    slots: [
      { x: 12, y: 22, w: 44, rot: -4 },
      { x: 44, y: 46, w: 44, rot: 4, fit: "bare" },
      { x: 14, y: 64, w: 40, rot: -3 },
    ],
    decor: [
      { src: "/doodles/mirrorball.png", x: 66, y: 9, w: 24, rot: 4 },
      { src: "/doodles/checked-bow.png", x: 4, y: 15, w: 16, rot: -12 },
      { src: "/doodles/red-stars.png", x: 2, y: 44, w: 13, rot: -8 },
      { src: "/doodles/sparkles.png", x: 77, y: 38, w: 14, rot: 0 },
      { src: "/doodles/star.png", x: 86, y: 64, w: 9, rot: 0 },
      { src: "/doodles/sparkles.png", x: 36, y: 15, w: 11, rot: 0 },
      { src: "/doodles/cherries.png", x: 75, y: 72, w: 15, rot: 8, top: true },
      { src: "/doodles/heart.png", x: 30, y: 55, w: 7, rot: 0, top: true },
      { src: "/doodles/heart.png", x: 60, y: 60, w: 6, rot: -8, top: true },
    ],
  },

  // 6 — baby (soft: clouds, sunshine, teddy, florals)
  {
    id: "our-little-one",
    name: "our little one",
    blurb: "for the newest tiny human ♡",
    texts: [
      { x: 14, y: 4, w: 72, rot: 0, text: "our little one", font: "cursive", size: 9, color: SKY, align: "center" },
      { x: 12, y: 91, w: 76, rot: 0, text: "welcome to the world, sweet baby", font: "hand", size: 4.5, color: INK, align: "center" },
      { x: 60, y: 40, w: 30, rot: 3, text: "so loved", font: "neat", size: 4.5, color: SAGE, align: "center" },
    ],
    slots: [
      { x: 14, y: 22, w: 50, rot: -4 },
      { x: 38, y: 50, w: 48, rot: 3, fit: "bare" },
    ],
    decor: [
      { src: "/doodles/cloud.png", x: 76, y: 1, w: 20, rot: 0 },
      { src: "/doodles/cloud.png", x: 4, y: 12, w: 15, rot: 0 },
      { src: "/doodles/my-sunshine.png", x: 1, y: 70, w: 30, rot: -3 },
      { src: "/doodles/teddy.png", x: 66, y: 66, w: 18, rot: 4 },
      { src: "/doodles/flower2.png", x: 82, y: 40, w: 10, rot: 0 },
      { src: "/doodles/leaves.png", x: 54, y: 82, w: 16, rot: 8 },
      { src: "/doodles/sparkles.png", x: 74, y: 22, w: 12, rot: 0 },
      { src: "/doodles/star.png", x: 6, y: 32, w: 8, rot: 0 },
      { src: "/doodles/heart.png", x: 42, y: 52, w: 7, rot: 0, top: true },
    ],
  },

  // 7 — one framed photo + a quote & date
  {
    id: "just-this-one",
    name: "just this one",
    blurb: "a single photo & the story behind it",
    texts: [
      { x: 16, y: 4, w: 68, rot: -1, text: "a moment to keep", font: "cursive", size: 7, color: INK, align: "center" },
      { x: 12, y: 83, w: 76, rot: 1, text: "some days i want to keep forever", font: "hand", size: 5, color: INK, align: "center" },
      { x: 58, y: 90, w: 32, rot: 1, text: "12 · 01 · 25", font: "typewriter", size: 3.6, color: INK, align: "center" },
    ],
    slots: [{ x: 22, y: 22, w: 55, rot: -2 }],
    decor: [
      { src: "/doodles/sprig.png", x: 1, y: 30, w: 14, rot: -12 },
      { src: "/doodles/kiss-print.png", x: 2, y: 56, w: 18, rot: -8 },
      { src: "/doodles/red-stars.png", x: 5, y: 74, w: 13, rot: -6 },
      { src: "/doodles/butterfly.png", x: 82, y: 26, w: 15, rot: 0 },
      { src: "/doodles/heart.png", x: 86, y: 48, w: 9, rot: 12 },
      { src: "/doodles/cherries.png", x: 82, y: 64, w: 14, rot: 8 },
      { src: "/doodles/star.png", x: 12, y: 14, w: 8, rot: 0 },
      { src: "/doodles/heart.png", x: 25, y: 26, w: 6, rot: 0, top: true },
    ],
  },

  // 8 — for him (pretty boy is mandatory)
  {
    id: "for-him",
    name: "for him",
    blurb: "for your pretty boy",
    texts: [
      { x: 8, y: 3, w: 52, rot: -2, text: "for him", font: "cutout", size: 7, color: INK, align: "left" },
      { x: 6, y: 64, w: 40, rot: 1, text: "the best of them all", font: "hand", size: 5, color: SAGE, align: "center" },
      { x: 54, y: 91, w: 34, rot: 2, text: "my person", font: "typewriter", size: 3.8, color: INK, align: "center" },
    ],
    slots: [
      { x: 40, y: 14, w: 40, rot: 4 },
      { x: 22, y: 42, w: 38, rot: -3, fit: "bare" },
      { x: 8, y: 58, w: 38, rot: -5 },
    ],
    decor: [
      { src: "/doodles/pretty-boy.png", x: 2, y: 6, w: 34, rot: -4 },
      { src: "/doodles/black-cat.png", x: 49, y: 4, w: 22, rot: 0 },
      { src: "/doodles/love-letter.png", x: 74, y: 5, w: 22, rot: 6 },
      { src: "/doodles/van-gogh-heart.png", x: 88, y: 42, w: 10, rot: 10 },
      { src: "/doodles/mirrorball.png", x: 68, y: 54, w: 19, rot: -4 },
      { src: "/doodles/red-stars.png", x: 2, y: 44, w: 13, rot: -8 },
      { src: "/doodles/star.png", x: 50, y: 40, w: 8, rot: 0 },
      { src: "/doodles/heart.png", x: 85, y: 70, w: 7, rot: 0 },
      { src: "/doodles/quote1.png", x: 50, y: 75, w: 33, rot: -3 },
    ],
  },

  // 9 — for her (my girl is mandatory)
  {
    id: "for-her",
    name: "for her",
    blurb: "for your girl",
    texts: [
      { x: 6, y: 3, w: 44, rot: -2, text: "for her", font: "cursive", size: 9, color: BLUSH, align: "left" },
      { x: 6, y: 62, w: 32, rot: 1, text: "mine ♡", font: "bubble", size: 5, color: RED, align: "center" },
      { x: 50, y: 90, w: 42, rot: 2, text: "prettiest girl", font: "hand", size: 5, color: BLUSH, align: "center" },
    ],
    slots: [
      { x: 42, y: 15, w: 38, rot: 4 },
      { x: 22, y: 43, w: 36, rot: -3, fit: "bare" },
      { x: 8, y: 60, w: 36, rot: -5 },
    ],
    decor: [
      { src: "/doodles/my-girl.png", x: 71, y: 1, w: 26, rot: 4 },
      { src: "/doodles/lilly.png", x: 1, y: 16, w: 14, rot: -6 },
      { src: "/doodles/tulip-boquet.png", x: -2, y: 33, w: 24, rot: -6 },
      { src: "/doodles/red-stars.png", x: 2, y: 52, w: 12, rot: -6 },
      { src: "/doodles/sunflowers.png", x: 82, y: 44, w: 15, rot: 0 },
      { src: "/doodles/flower2.png", x: 87, y: 20, w: 9, rot: 0 },
      { src: "/doodles/butterfly.png", x: 83, y: 64, w: 15, rot: 0 },
      { src: "/doodles/cherries.png", x: 53, y: 1, w: 13, rot: 6 },
      { src: "/doodles/sparkles.png", x: 40, y: 9, w: 10, rot: 0 },
      { src: "/doodles/kiss-print.png", x: 62, y: 70, w: 20, rot: 8 },
      { src: "/doodles/checked-bow.png", x: 2, y: 70, w: 15, rot: -10, top: true },
      { src: "/doodles/fingerprint-heart.png", x: 40, y: 20, w: 8, rot: 6, top: true },
      { src: "/doodles/heart.png", x: 44, y: 52, w: 7, rot: 0, top: true },
    ],
  },
];

export const getTemplate = (id: string) => TEMPLATES.find((t) => t.id === id);
