import Link from "next/link";
import { TEMPLATES } from "@/lib/templates";
import { PAGE_RATIO } from "@/lib/scrapbook";
import { TemplatePage } from "@/components/TemplatePage";
import { SuggestionForm } from "@/components/SuggestionForm";
import { Reveal } from "@/components/Reveal";

export default function Gallery() {
  return (
    <main className="flex-1 flex flex-col items-center px-6 py-14">
      <Link href="/start" className="hand text-2xl text-ink-soft hover:text-ink self-start absolute top-6 left-6">
        ← back
      </Link>

      <h1 className="hand text-5xl sm:text-6xl text-ink text-center mb-2">pick a template ♡</h1>
      <p className="text-ink-soft text-center mb-10">choose a page you love — you&apos;ll add your own photos next</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 w-full max-w-5xl justify-items-center">
        {TEMPLATES.map((t, i) => (
          <Reveal key={t.id} delay={i * 60}>
            <Link href={`/templates/${t.id}`} className="group text-center block">
              <div className="rounded-[6px] overflow-hidden shadow-[3px_6px_16px_rgba(74,64,56,0.2)] transition-transform group-hover:-translate-y-1 group-hover:rotate-[-1deg]">
                <TemplatePage template={t} pw={220} />
              </div>
              <p className="hand text-3xl text-ink mt-3">{t.name}</p>
              <p className="text-ink-soft text-sm">{t.blurb}</p>
            </Link>
          </Reveal>
        ))}

        {/* cheeky "coming soon" placeholder at the end */}
        <div className="text-center">
          <div
            className="rounded-[6px] border-2 border-dashed border-ink/25 bg-[#fffdf8]/40 flex flex-col items-center justify-center text-center px-5 -rotate-1"
            style={{ width: 220, height: Math.round(220 * PAGE_RATIO) }}
          >
            <span className="text-4xl mb-2 select-none">🫡</span>
            <p className="hand text-2xl text-ink leading-snug">
              cooking up more<br />pretty pages…
            </p>
            <p className="hand text-2xl text-blush mt-2 leading-snug">trust me bro 🤞</p>
          </div>
          <p className="hand text-3xl text-ink mt-3">more soon</p>
          <p className="text-ink-soft text-sm">i&apos;m working reeeally hard, promise ♡</p>
        </div>
      </div>

      {/* wishlist */}
      <div className="mt-20 w-full max-w-md text-center bg-[#fffdf8]/50 border border-ink/10 rounded-3xl p-6">
        <h2 className="hand text-4xl text-ink mb-1">got a template in mind?</h2>
        <p className="text-ink-soft mb-4">tell me what to make next & i&apos;ll add it ♡</p>
        <SuggestionForm kind="template" placeholder="e.g. an anniversary page, a graduation one…" />
      </div>
    </main>
  );
}
