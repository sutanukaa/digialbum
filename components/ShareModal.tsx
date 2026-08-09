"use client";

import { useState } from "react";
import Link from "next/link";
import { HeartsBurst } from "@/components/HeartsBurst";

// Success card shown after saving. On first create it opens with a little
// chai appeal; "wrap up my link" pretends to tie a bow for a moment, then
// reveals the share + secret edit links. Edits skip straight to the links.
export function ShareModal({
  id,
  editToken,
  edited,
  onClose,
}: {
  id: string;
  editToken: string;
  edited: boolean;
  onClose: () => void;
}) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = `${origin}/s/${id}`;
  const editUrl = `${origin}/s/${id}/edit?token=${editToken}`;
  // "chai" → "wrapping" (fake loading) → "links"
  const [stage, setStage] = useState<"chai" | "wrapping" | "links">(edited ? "links" : "chai");

  function revealLinks() {
    setStage("wrapping");
    setTimeout(() => setStage("links"), 1600);
  }

  return (
    <div className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm flex items-center justify-center p-6" onClick={onClose}>
      <div className="relative bg-cream max-w-md w-full rounded-3xl p-8 shadow-2xl text-center border border-ink/10" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} aria-label="close" className="absolute top-3 right-4 text-ink-soft hover:text-ink text-2xl leading-none">
          ✕
        </button>

        {stage === "chai" ? (
          <>
            <ChaiCup className="w-20 h-20 mx-auto mb-1" />
            <h3 className="hand text-4xl text-ink mb-3">one tiny thing ♡</h3>
            <p className="text-ink-soft leading-relaxed mb-1">
              your scrapbook is all glued in and ready. keeping this little corner
              of the internet running — the servers, the paper, the tape — costs
              a bit, and a chai from you would help so much.
            </p>
            <p className="text-ink-soft leading-relaxed mb-6">
              and if you can&apos;t right now, that&apos;s completely okay too.
              your link is yours either way ♡
            </p>
            <a
              href="https://buymeachai.in/sutanukachaa"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-blush/90 text-ink px-8 py-3 text-lg shadow-[3px_4px_0_0_rgba(74,64,56,0.25)] hover:-translate-y-0.5 hover:rotate-[-1deg] transition-transform"
            >
              buy me a chai ☕
            </a>
            <div className="mt-4">
              <button onClick={revealLinks} className="text-ink-soft underline underline-offset-4 decoration-ink/30 hover:text-ink transition-colors">
                here&apos;s your link →
              </button>
            </div>
          </>
        ) : stage === "wrapping" ? (
          <div className="py-8">
            <ChaiCup className="w-16 h-16 mx-auto mb-3 sway" />
            <p className="hand text-3xl text-ink">tying a little bow on it…</p>
          </div>
        ) : (
          <>
            <HeartsBurst />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/doodles/heart.png" alt="" className="w-16 h-auto mx-auto mb-2" />
            <h3 className="hand text-4xl text-ink mb-2">{edited ? "saved!" : "it's ready!"}</h3>
            <p className="text-ink-soft mb-6">{edited ? "your changes are live ♡" : "share this link with someone you love ♡"}</p>

            <LinkRow label="share link" url={shareUrl} />
            {!edited ? <LinkRow label="secret edit link — keep this to yourself" url={editUrl} hint="bookmark it! it's the only way back to edit." /> : null}

            <Link href={`/s/${id}`} className="inline-block mt-6 rounded-full bg-ink text-cream px-8 py-3 text-lg shadow-[3px_4px_0_0_rgba(74,64,56,0.25)] hover:-translate-y-0.5 transition-transform">
              open my scrapbook →
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

// hand-drawn cutting-chai glass with drifting steam (steam keyframes live in globals.css)
function ChaiCup({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <g stroke="var(--ink-soft)" strokeWidth="1.6" strokeLinecap="round" fill="none">
        <path d="M12 9 C 11 7, 13 6, 12 4" className="steam" />
        <path d="M17 9 C 16 7, 18 6, 17 3.5" className="steam steam-2" />
      </g>
      <path
        d="M9 12 h11 l-1.5 12 a2 2 0 0 1 -2 1.8 h-4 a2 2 0 0 1 -2 -1.8 Z"
        fill="#fffdf8" stroke="var(--ink)" strokeWidth="1.8" strokeLinejoin="round"
      />
      <path d="M10 15.5 h9" stroke="var(--blush)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M20 14 c 4 0, 4 6, -0.8 6.5" fill="none" stroke="var(--ink)" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function LinkRow({ label, url, hint }: { label: string; url: string; hint?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="text-left mb-4">
      <p className="hand text-xl text-ink">{label}</p>
      <div className="flex gap-2 mt-1">
        <input readOnly value={url} onFocus={(e) => e.currentTarget.select()} className="flex-1 min-w-0 bg-[#fffdf8] border border-ink/15 rounded-lg px-3 py-2 text-sm text-ink-soft" />
        <button
          onClick={() => {
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="shrink-0 rounded-lg bg-ink text-cream px-4 text-sm hover:-translate-y-0.5 transition-transform"
        >
          {copied ? "copied!" : "copy"}
        </button>
      </div>
      {hint ? <p className="text-ink-soft/70 text-xs mt-1">{hint}</p> : null}
    </div>
  );
}
