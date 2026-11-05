import { describe, expect, it } from "vitest";
import { daysShowedUpFromState, emptyState } from "./storage";

describe("daysShowedUpFromState", () => {
  it("never drops below the stored streak count", () => {
    expect(
      daysShowedUpFromState({
        ...emptyState,
        streak: 12,
        lastPassedDate: "2026-10-01",
        executables: [],
      })
    ).toBe(12);
  });

  it("counts distinct complete executable dates", () => {
    expect(
      daysShowedUpFromState({
        ...emptyState,
        streak: 1,
        executables: [
          { id: "a", date: "2026-10-01", slots: [], status: "complete" },
          { id: "b", date: "2026-10-03", slots: [], status: "complete" },
          { id: "c", date: "2026-10-03", slots: [], status: "draft" },
        ],
      })
    ).toBe(2);
  });
});
