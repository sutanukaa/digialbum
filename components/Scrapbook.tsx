// The scrapbook renderer. Used by BOTH the editor preview and the final shared page.
// Layout is deterministic-by-index (rotation, tape choice) so it looks hand-placed
// without any drag-and-drop. ponytail: fixed pretty slots beat a free canvas for v1.

export type Item = { id: string; src: string; caption?: string };

const TAPES = ["/tape1.png", "/tape2.png", "/tape3.png"];
const ROT = [-3, 2.5, -1.5, 3, -2, 1.5, -2.5, 2]; // gentle, repeats past 8

function PhotoCard({ item, i }: { item: Item; i: number }) {
  const rot = ROT[i % ROT.length];
  const usePaperclip = i % 4 === 3; // every 4th photo gets a clip instead of tape
  const tape = TAPES[i % TAPES.length];

  return (
    <div
      className="break-inside-avoid mb-8 w-full"
      style={{ transform: `rotate(${rot}deg)` }}
    >
      <div className="relative bg-[#fffdf8] px-3 pt-3 pb-2 rounded-[3px] shadow-[3px_5px_12px_rgba(74,64,56,0.18)]">
        {/* attachment: tape or paperclip */}
        {usePaperclip ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/paperclip.png"
            alt=""
            className="absolute -top-4 right-4 w-8 h-auto pointer-events-none select-none z-10"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tape}
            alt=""
            className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-24 h-auto pointer-events-none select-none z-10"
            style={{ transform: `translateX(-50%) rotate(${rot * -1.5}deg)` }}
          />
        )}

        {/* the photo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.src}
          alt={item.caption || ""}
          className="w-full h-auto rounded-[2px] block"
        />

        {/* thick bottom strip — holds the handwritten caption (stays blank but present without one) */}
        <div className="min-h-[3rem] flex items-center justify-center pt-3 px-1">
          {item.caption ? (
            <p className="hand text-ink text-2xl leading-tight text-center">{item.caption}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function Scrapbook({ title, items }: { title: string; items: Item[] }) {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-10">
      {/* title */}
      <div className="relative text-center mb-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/doodles/sprig.png"
          alt=""
          className="absolute -left-2 -top-4 w-14 h-auto opacity-90 -rotate-12 select-none pointer-events-none hidden sm:block"
        />
        <h1 className="hand text-ink text-5xl sm:text-6xl leading-tight inline-block">
          {title || "our little scrapbook"}
        </h1>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/doodles/heart.png"
          alt=""
          className="absolute -right-1 top-0 w-10 h-auto rotate-12 select-none pointer-events-none hidden sm:block"
        />
      </div>

      {/* photos, masonry via CSS columns — no JS, no layout lib */}
      {items.length === 0 ? (
        <p className="text-center text-ink-soft hand text-2xl py-16">
          nothing taped in yet…
        </p>
      ) : (
        <div className="columns-1 sm:columns-2 gap-8">
          {items.map((item, i) => (
            <PhotoCard key={item.id} item={item} i={i} />
          ))}
        </div>
      )}
    </div>
  );
}
