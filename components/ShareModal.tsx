"use client";

import { useState } from "react";
import Link from "next/link";
import { HeartsBurst } from "@/components/HeartsBurst";

// Success card shown after saving: share link + (on create) the secret edit link.
// Closeable via the ✕ or backdrop, so the editor underneath is right there.
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

  return (
    <div className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm flex items-center justify-center p-6" onClick={onClose}>
      <div className="relative bg-cream max-w-md w-full rounded-3xl p-8 shadow-2xl text-center border border-ink/10" onClick={(e) => e.stopPropagation()}>
        <HeartsBurst />
        <button onClick={onClose} aria-label="close" className="absolute top-3 right-4 text-ink-soft hover:text-ink text-2xl leading-none">
          ✕
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/doodles/heart.png" alt="" className="w-16 h-auto mx-auto mb-2" />
        <h3 className="hand text-4xl text-ink mb-2">{edited ? "saved!" : "it's ready!"}</h3>
        <p className="text-ink-soft mb-6">{edited ? "your changes are live ♡" : "share this link with someone you love ♡"}</p>

        <LinkRow label="share link" url={shareUrl} />
        {!edited ? <LinkRow label="secret edit link — keep this to yourself" url={editUrl} hint="bookmark it! it's the only way back to edit." /> : null}

        <Link href={`/s/${id}`} className="inline-block mt-6 rounded-full bg-ink text-cream px-8 py-3 text-lg shadow-[3px_4px_0_0_rgba(74,64,56,0.25)] hover:-translate-y-0.5 transition-transform">
          open my scrapbook →
        </Link>
      </div>
    </div>
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
