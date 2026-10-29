import { describe, expect, it } from "vitest";
import manifest from "@/app/manifest";
import { ONE_TAP_RUN_URL, pickOneTapScript, shouldAutoStart } from "./oneTap";

describe("one-tap run", () => {
  it("manifest has a Home Screen shortcut to the one-tap run", () => {
    const s = manifest().shortcuts ?? [];
    expect(s[0]?.url).toBe(ONE_TAP_RUN_URL);
    expect(s[0]?.name).toMatch(/25/);
  });
  it("picks a 25-min runnable script and skips bugs", () => {
    const pick = pickOneTapScript([
      { id: "b", type: "bug", durationMin: 25 },
      { id: "x", type: "habit", durationMin: 10 },
      { id: "y", type: "habit", durationMin: 25 },
    ] as never);
    expect(pick?.id).toBe("y");
  });
  it("only starts once: never over a running or paused session", () => {
    expect(shouldAutoStart("1", null)).toBe(true);
    expect(shouldAutoStart("1", { scriptId: "a", status: "complete" })).toBe(true);
    expect(shouldAutoStart("1", { scriptId: "a", status: "running" })).toBe(false);
    expect(shouldAutoStart("1", { scriptId: "a", status: "paused" })).toBe(false);
    expect(shouldAutoStart(null, null)).toBe(false);
  });
});
