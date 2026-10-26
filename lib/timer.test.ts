import { describe, it, expect } from "vitest";
import { canPlayChime } from "./chime";
import {
  formatClock,
  idleSession,
  parseSession,
  pauseSession,
  secondsLeft,
  serializeSession,
  settleSession,
  startSession,
} from "./timer";

const T0 = 1_700_000_000_000;

describe("session timer", () => {
  it("derives remaining time from the start timestamp and ignores tick counts", () => {
    const running = startSession(idleSession("breath", 600), T0);
    expect(running.status).toBe("running");
    expect(running.startedAt).toBe(T0);
    expect(running.budgetSec).toBe(600);

    expect(secondsLeft(running, T0)).toBe(600);
    expect(secondsLeft(running, T0 + 5_000)).toBe(595);
    // One observation four minutes later. No intermediate decrements.
    expect(secondsLeft(running, T0 + 240_000)).toBe(360);
    expect(secondsLeft(running, T0 + 600_000)).toBe(0);
    expect(running.remainingSec).toBe(600);
  });

  it("pauses by freezing the timestamp math and resumes from that budget", () => {
    const running = startSession(idleSession("breath", 600), T0);
    const paused = pauseSession(running, T0 + 90_000);
    expect(paused.status).toBe("paused");
    expect(paused.startedAt).toBeNull();
    expect(paused.remainingSec).toBe(510);
    expect(secondsLeft(paused, T0 + 500_000)).toBe(510);

    const resumed = startSession(paused, T0 + 200_000);
    expect(resumed.startedAt).toBe(T0 + 200_000);
    expect(resumed.budgetSec).toBe(510);
    expect(secondsLeft(resumed, T0 + 200_000 + 10_000)).toBe(500);
  });

  it("settles a finished run without mutating an in-progress one", () => {
    const running = startSession(idleSession("breath", 60), T0);
    expect(settleSession(running, T0 + 30_000)).toBe(running);
    const done = settleSession(running, T0 + 60_000);
    expect(done.status).toBe("complete");
    expect(secondsLeft(done, T0 + 90_000)).toBe(0);
    expect(done.startedAt).toBe(T0);
  });

  it("round-trips a running session through persisted JSON", () => {
    const running = startSession(idleSession("breath", 600), T0);
    const restored = parseSession(serializeSession(running));
    expect(restored).toEqual(running);
    expect(secondsLeft(restored!, T0 + 125_000)).toBe(475);
    expect(parseSession("not json")).toBeNull();
    expect(parseSession(JSON.stringify({ hello: "world" }))).toBeNull();
  });

  it("formats the clock", () => {
    expect(formatClock(600)).toBe("10:00");
    expect(formatClock(59)).toBe("00:59");
  });
});

describe("end chime autoplay", () => {
  it("plays only when the audio context is already running", () => {
    expect(canPlayChime("running")).toBe(true);
    expect(canPlayChime("suspended")).toBe(false);
    expect(canPlayChime("missing")).toBe(false);
    expect(canPlayChime("closed")).toBe(false);
    expect(canPlayChime("interrupted")).toBe(false);
  });
});
