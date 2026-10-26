/**
 * End-of-session chime.
 * Browsers will not play audio until a user gesture has resumed an
 * AudioContext. Call `primeChime` from the Start click. `playEndChime`
 * stays silent when the context is missing or still suspended.
 */

export type ChimeAudioState =
  | "missing"
  | "suspended"
  | "running"
  | "closed"
  | "interrupted";

export function canPlayChime(state: ChimeAudioState): boolean {
  return state === "running";
}

type AudioContextCtor = typeof AudioContext;

let ctx: AudioContext | null = null;

function ctor(): AudioContextCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    AudioContext?: AudioContextCtor;
    webkitAudioContext?: AudioContextCtor;
  };
  return w.AudioContext ?? w.webkitAudioContext ?? null;
}

export function chimeContextState(): ChimeAudioState {
  if (!ctx) return "missing";
  return ctx.state as ChimeAudioState;
}

/** Call synchronously inside the gesture that starts the timer. */
export function primeChime(): void {
  const Ctor = ctor();
  if (!Ctor) return;
  try {
    if (!ctx) ctx = new Ctor();
    if (ctx.state === "suspended") void ctx.resume();
  } catch {
    ctx = null;
  }
}

function tone(context: AudioContext, frequency: number, when: number): void {
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(frequency, when);
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(0.18, when + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.35);
  osc.connect(gain);
  gain.connect(context.destination);
  osc.start(when);
  osc.stop(when + 0.4);
}

/** Returns false when autoplay rules (or a missing context) block the chime. */
export async function playEndChime(): Promise<boolean> {
  if (!ctx) return false;
  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
    } catch {
      return false;
    }
  }
  if (!canPlayChime(ctx.state as ChimeAudioState)) return false;
  const start = ctx.currentTime + 0.01;
  tone(ctx, 880, start);
  tone(ctx, 1174.66, start + 0.18);
  return true;
}
