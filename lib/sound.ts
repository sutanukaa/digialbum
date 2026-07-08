// Tiny synthesized sounds — no asset files. A soft paper "shuff" for page turns
// and a faint pencil "tick" for clicks. Respects a persisted mute flag.

let ctx: AudioContext | null = null;
let muted = false;

if (typeof window !== "undefined") {
  muted = localStorage.getItem("scrapbook-muted") === "1";
}

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

export function isMuted() {
  return muted;
}
export function setMuted(m: boolean) {
  muted = m;
  if (typeof window !== "undefined") localStorage.setItem("scrapbook-muted", m ? "1" : "0");
}

// decaying-noise buffer helper
function noiseBuffer(a: AudioContext, dur: number, curve: number) {
  const buf = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    const t = i / data.length;
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, curve);
  }
  return buf;
}

// soft paper shuffle — high, airy noise that swells then fades (no low-end = no thump)
export function playPageTurn() {
  const a = ac();
  if (!a || muted) return;
  const dur = 0.24;
  const buf = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    const t = i / data.length;
    // gentle swell (rise then fall) so there's no percussive attack
    const env = Math.pow(Math.sin(Math.PI * t), 1.4);
    data[i] = (Math.random() * 2 - 1) * env;
  }
  const src = a.createBufferSource();
  src.buffer = buf;
  const hp = a.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 2400; // strip the low "whumpf"
  const lp = a.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 9000; // keep it soft, not hissy
  const g = a.createGain();
  g.gain.value = 0.11;
  src.connect(hp);
  hp.connect(lp);
  lp.connect(g);
  g.connect(a.destination);
  src.start();
}

// faint pencil tick on click
export function playTick() {
  const a = ac();
  if (!a || muted) return;
  const dur = 0.055;
  const src = a.createBufferSource();
  src.buffer = noiseBuffer(a, dur, 3);
  const hp = a.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 1800;
  const g = a.createGain();
  g.gain.value = 0.06;
  src.connect(hp);
  hp.connect(g);
  g.connect(a.destination);
  src.start();
}
