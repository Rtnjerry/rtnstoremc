"use client";

let ctx: AudioContext | null = null;
let enabled = true;

export function setSoundEnabled(v: boolean) {
  enabled = v;
}

function ac() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType, vol: number, delay = 0, slideTo?: number) {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + delay;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

export type Sfx = "tap" | "pop" | "success" | "error" | "toggle" | "open";

export function play(s: Sfx) {
  if (!enabled) return;
  switch (s) {
    case "tap":
      return tone(1800, 0.035, "sine", 0.06, 0, 1200);
    case "toggle":
      return tone(900, 0.05, "triangle", 0.07, 0, 1400);
    case "open":
      tone(500, 0.12, "sine", 0.05, 0, 900);
      return;
    case "pop":
      tone(660, 0.08, "sine", 0.09, 0, 1320);
      tone(1320, 0.1, "sine", 0.05, 0.05);
      return;
    case "success":
      tone(784, 0.12, "sine", 0.08);
      tone(988, 0.12, "sine", 0.08, 0.09);
      tone(1319, 0.22, "sine", 0.08, 0.18);
      return;
    case "error":
      tone(300, 0.12, "square", 0.04);
      tone(220, 0.18, "square", 0.04, 0.1);
      return;
  }
}
