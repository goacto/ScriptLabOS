import { describe, it, expect } from "vitest";
import { importState, migrateState } from "./storage";
import { makeGss } from "./gss";

describe("migrateState", () => {
  const legacy = {
    scripts: [
      { ...makeGss({ title: "doomscroll", type: "bug" }), runs: [{ at: "2026-10-01T00:00:00Z", completed: true, durationMin: 0 }] },
      { ...makeGss({ title: "breath", type: "baseline" }), runs: [{ at: "2026-10-01T00:00:00Z", completed: true, durationMin: 10 }] },
    ],
  };

  it("turns legacy Quick Log runs into relapses and other runs into sessions", () => {
    const migrated = migrateState(legacy);
    expect(migrated.scripts[0].runs[0]).toMatchObject({ kind: "relapse", completed: false });
    expect(migrated.scripts[1].runs[0]).toMatchObject({ kind: "session", completed: true });
    expect(migrated.xp).toBe(0); // defaults filled from emptyState
  });

  it("is idempotent and keeps saved reviews", () => {
    const review = { whatWorked: "a", whatDidnt: "b", insights: "c" };
    const withReview = migrateState({
      scripts: [{ ...legacy.scripts[1], runs: [{ ...legacy.scripts[1].runs[0], kind: "session", review }] }],
    });
    expect(migrateState(withReview)).toEqual(withReview);
    expect(withReview.scripts[0].runs[0].review).toEqual(review);
  });

  it("applies on import of an exported legacy backup", () => {
    expect(importState(JSON.stringify(legacy)).scripts[0].runs[0].kind).toBe("relapse");
  });
});
