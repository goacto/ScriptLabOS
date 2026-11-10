import { describe, expect, it } from "vitest";
import { partitionAchievements } from "./achievements";

const a = { id: "first-run", title: "Hello World" };
const b = { id: "first-compile", title: "First Compile" };

describe("partitionAchievements", () => {
  it("does not treat the empty pre-hydration list as already seen", () => {
    const seen = new Set<string>();
    const before = partitionAchievements(seen, [], false, false);
    expect(before).toEqual({ announce: [], markSeen: [], initialized: false });

    const loaded = partitionAchievements(seen, [a, b], true, before.initialized);
    expect(loaded.announce).toEqual([]);
    expect(loaded.markSeen).toEqual([a, b]);
    expect(loaded.initialized).toBe(true);
    loaded.markSeen.forEach((item) => seen.add(item.id));

    const again = partitionAchievements(seen, [a, b], true, loaded.initialized);
    expect(again.announce).toEqual([]);
  });

  it("announces only an achievement unlocked after the saved ones were seeded", () => {
    const seen = new Set(["first-run"]);
    const next = partitionAchievements(seen, [a, b], true, true);
    expect(next.announce).toEqual([b]);
    expect(next.markSeen).toEqual([b]);
  });
});
