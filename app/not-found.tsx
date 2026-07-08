import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/doodles/butterfly.png" alt="" className="w-24 h-auto mb-4 sway" />
      <h1 className="hand text-6xl sm:text-7xl text-ink mb-2 leading-tight">oh no, this page wandered off…</h1>
      <p className="text-ink-soft text-lg mb-8">it probably went looking for glue and got a little distracted ✿</p>
      <Link
        href="/"
        className="rounded-full bg-ink text-cream px-8 py-3 text-lg shadow-[3px_4px_0_0_rgba(74,64,56,0.25)] hover:-translate-y-0.5 transition-transform"
      >
        back to the cover →
      </Link>
    </main>
  );
}
