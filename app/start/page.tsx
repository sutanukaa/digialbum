import Link from "next/link";

// The fork after "open the notebook": use a template, or build from scratch.
// The two round illustrations are placeholders — swap the emoji block for
// <img src="/choice-template.png"> and <img src="/choice-diy.png"> when ready.
export default function Start() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
      <Link href="/" className="hand text-2xl text-ink-soft hover:text-ink mb-2 self-start absolute top-6 left-6">
        ← cover
      </Link>

      <p className="hand text-4xl sm:text-5xl text-ink text-center mb-10">
        how would you like to begin?
      </p>

      <div className="flex flex-col md:flex-row gap-6 w-full max-w-3xl">
        <ChoiceCard
          href="/templates"
          img="/doodles/tulip-boquet.png"
          heading="ooh, pick a pretty one!"
          blurb="start from a ready-made page — just pop your photos into the little frames and you're done ♡"
          cta="browse templates"
        />
        <ChoiceCard
          href="/new"
          img="/doodles/paper-with-paper-clip.png"
          heading="craft it yourself!"
          blurb="a blank page and all the bits & bobs — drag, tape, doodle & write to your heart's content ✿"
          cta="start from scratch"
        />
      </div>
    </main>
  );
}

function ChoiceCard({
  href,
  img,
  heading,
  blurb,
  cta,
}: {
  href: string;
  img: string;
  heading: string;
  blurb: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="group flex-1 bg-[#fffdf8]/70 border border-ink/10 rounded-3xl p-8 text-center
                 shadow-[3px_5px_0_0_rgba(74,64,56,0.12)] transition-transform hover:-translate-y-1 hover:rotate-[-0.5deg]"
    >
      {/* doodle illustration */}
      <div className="w-28 h-28 mx-auto mb-5 rounded-full bg-blush/15 border border-ink/10 flex items-center justify-center select-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img} alt="" className="w-20 h-20 object-contain" />
      </div>

      <h2 className="hand text-4xl text-ink leading-tight">{heading}</h2>
      <p className="text-ink-soft mt-3 leading-relaxed">{blurb}</p>

      <span className="inline-flex items-center gap-2 mt-6 rounded-full bg-ink text-cream px-6 py-2.5 text-lg shadow-[3px_4px_0_0_rgba(74,64,56,0.25)]">
        {cta}
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </span>
    </Link>
  );
}
