import Link from "next/link";

// taped polaroids of loved ones, flung across the page like a real scrapbook —
// mixed sizes, irregular positions, every one tilted at a different angle.
// hidden below lg — on narrow screens they'd cover the title.
const POLAROIDS = [
  { src: "/people/couple1.png", tape: "/tape1.png", pos: "top-8 left-[9%]", w: "w-44", rot: -9 },
  { src: "/people/friends.png", tape: "/tape2.png", pos: "top-16 right-[11%]", w: "w-40", rot: 7 },
  { src: "/people/bffs.png", tape: "/tape3.png", pos: "top-[43%] left-3", w: "w-36", rot: -6 },
  { src: "/people/family.png", tape: "/tape2.png", pos: "bottom-10 left-[13%]", w: "w-48", rot: 8 },
  { src: "/people/couple2.png", tape: "/tape1.png", pos: "bottom-16 right-[9%]", w: "w-44", rot: -12 },
];

function Polaroid({ src, tape, rot }: { src: string; tape: string; rot: number }) {
  return (
    <div className="relative bg-[#fffdf8] px-3 pt-3 pb-8 rounded-[3px] shadow-[3px_6px_14px_rgba(74,64,56,0.2)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={tape}
        alt=""
        aria-hidden
        className="absolute -top-3 left-1/2 w-16 h-auto pointer-events-none select-none z-10"
        style={{ transform: `translateX(-50%) rotate(${rot * -1.5}deg)` }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" aria-hidden className="w-full h-auto rounded-[2px] block" />
    </div>
  );
}

export default function Cover() {
  return (
    <main className="relative flex-1 flex flex-col items-center justify-center px-6 py-16 text-center overflow-hidden">
      {/* scattered polaroids — outer div animates the entrance, inner div holds the
          tilt so the two transforms don't overwrite each other */}
      {POLAROIDS.map((p, i) => (
        <div
          key={i}
          className={`rise absolute ${p.pos} ${p.w} hidden lg:block select-none pointer-events-none`}
          style={{ animationDelay: `${0.5 + i * 0.15}s` }}
        >
          <div style={{ transform: `rotate(${p.rot}deg)` }}>
            <Polaroid src={p.src} tape={p.tape} rot={p.rot} />
          </div>
        </div>
      ))}

      <div className="relative z-10 max-w-2xl flex flex-col items-center">
        {/* kicker */}
        <p className="rise text-ink-soft tracking-[0.4em] text-sm uppercase mb-4">
          ♡ welcome ♡
        </p>

        {/* hero bouquet */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/cover-doodle.png"
          alt="a little bouquet of sunflowers tied with a bow"
          className="rise rise-1 w-64 sm:w-80 h-auto -rotate-2 select-none pointer-events-none
                     drop-shadow-[2px_6px_10px_rgba(74,64,56,0.18)]"
        />

        {/* handwritten title */}
        <h1 className="rise rise-1 hand text-ink text-7xl sm:text-8xl leading-[0.95] -mt-2">
          a little scrapbook
        </h1>

        {/* subtitle */}
        <p className="rise rise-2 text-ink-soft text-xl sm:text-2xl mt-6 leading-relaxed max-w-lg">
          a cozy place to keep your favorite moments — taped in, doodled on,
          and shared with someone you love.
        </p>

        {/* the invitation */}
        <Link
          href="/new"
          className="rise rise-3 group mt-10 inline-flex items-center gap-2 rounded-full
                     bg-ink text-cream px-10 py-4 text-xl shadow-[3px_5px_0_0_rgba(74,64,56,0.25)]
                     transition-transform hover:-translate-y-0.5 hover:rotate-[-1deg] active:translate-y-0"
        >
          open the notebook
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>

        <p className="rise rise-3 hand text-ink-soft/80 text-2xl mt-12">
          made with ♡ and a lot of paper
        </p>
      </div>
    </main>
  );
}
