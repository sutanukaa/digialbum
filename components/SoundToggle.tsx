"use client";

import { useEffect, useState } from "react";
import { isMuted, setMuted, playTick } from "@/lib/sound";

// Floating mute button (bottom-right) + plays a faint tick on any click.
export function SoundToggle() {
  const [muted, setMutedState] = useState(false);

  useEffect(() => setMutedState(isMuted()), []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("a, button, [role='button'], label")) playTick();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  function toggle() {
    const m = !muted;
    setMuted(m);
    setMutedState(m);
    if (!m) playTick();
  }

  return (
    <button
      onClick={toggle}
      aria-label={muted ? "turn sounds on" : "turn sounds off"}
      title={muted ? "sounds off" : "sounds on"}
      className="fixed bottom-4 right-4 z-40 w-11 h-11 rounded-full bg-cream border border-ink/15 shadow-[2px_3px_0_0_rgba(74,64,56,0.2)] flex items-center justify-center text-xl hover:-translate-y-0.5 transition-transform"
    >
      {muted ? "🔇" : "🔊"}
    </button>
  );
}
