"use client";

import { useState } from "react";

// Little wish form (doodle / template requests) → POST /api/suggestions.
// Pass `trigger` to make it collapsible: only the trigger text shows until
// clicked; clicking again (or hitting send) closes it.
export function SuggestionForm({
  kind,
  placeholder,
  trigger,
}: {
  kind: "doodle" | "template";
  placeholder: string;
  trigger?: string;
}) {
  const collapsible = !!trigger;
  const [open, setOpen] = useState(!collapsible);
  const [text, setText] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setState("sending");
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, text, email }),
      });
      if (!res.ok) throw new Error();
      setText("");
      setEmail("");
      setState("done");
      if (collapsible) setOpen(false); // close on send
    } catch {
      setState("error");
    }
  }

  const form = (
    <form onSubmit={submit} className="space-y-2 text-left mt-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        maxLength={500}
        autoFocus={collapsible}
        className="w-full bg-[#fffdf8] border border-ink/15 rounded-lg px-3 py-2 text-ink outline-none focus:border-blush placeholder:text-ink-soft/50"
      />
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        placeholder="your email (optional)"
        className="w-full bg-[#fffdf8] border border-ink/15 rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-blush placeholder:text-ink-soft/50"
      />
      <button
        type="submit"
        disabled={state === "sending" || !text.trim()}
        className="w-full rounded-full bg-ink text-cream py-2 text-lg shadow-[2px_3px_0_0_rgba(74,64,56,0.25)] hover:-translate-y-0.5 transition-transform disabled:opacity-40 disabled:hover:translate-y-0"
      >
        {state === "sending" ? "sending…" : "send it my way ♡"}
      </button>
      {state === "error" ? <p className="text-blush text-sm text-center">oops — try again?</p> : null}
    </form>
  );

  if (collapsible) {
    return (
      <div>
        <button
          type="button"
          onClick={() => {
            setOpen((o) => !o);
            setState("idle");
          }}
          className="hand text-lg text-ink hover:text-blush transition-colors"
        >
          {!open && state === "done" ? "got it — thank you! ♡" : trigger}
          <span className="text-ink-soft/60 ml-1">{open ? "▾" : "＋"}</span>
        </button>
        {open ? form : null}
      </div>
    );
  }

  if (state === "done") {
    return <p className="hand text-2xl text-blush text-center py-3">got it — thank you! ♡</p>;
  }
  return form;
}
