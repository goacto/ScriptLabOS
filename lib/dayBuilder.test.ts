import { describe, expect, it } from "vitest";
import { moveSlot } from "./dayBuilder";

describe("moveSlot", () => {
  const slots = [
    { time: "05:00", scriptId: "a" },
    { time: "06:00" },
    { time: "07:00", packageId: "p" },
  ];
  it("moves an item into an empty hour", () => {
    const out = moveSlot(slots, 0, 1);
    expect(out[0]).toEqual({ time: "05:00" });
    expect(out[1]).toEqual({ time: "06:00", scriptId: "a" });
  });
  it("swaps two placed items and keeps times", () => {
    const out = moveSlot(slots, 0, 2);
    expect(out[0]).toEqual({ time: "05:00", packageId: "p" });
    expect(out[2]).toEqual({ time: "07:00", scriptId: "a" });
  });
  it("is a no-op for the same slot", () => {
    expect(moveSlot(slots, 1, 1)).toBe(slots);
  });
});
