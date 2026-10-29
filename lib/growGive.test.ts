import { describe, it, expect } from "vitest";
import { canShipDay, toggleGrowGive } from "./reflection";

describe("evening reflection Grow / Give", () => {
  it("nothing selected by default and toggles on/off", () => {
    expect(toggleGrowGive(undefined, "give")).toEqual(["give"]);
    expect(toggleGrowGive(["give"], "grow")).toEqual(["grow", "give"]);
    expect(toggleGrowGive(["grow", "give"], "grow")).toEqual(["give"]);
  });
  it("new fields are optional and never block shipping", () => {
    expect(canShipDay({ wins: "a", challenges: "b", tomorrowFocus: "" })).toBe(true);
    expect(canShipDay({ wins: "a", challenges: "b", tomorrowFocus: "", growGive: [], details: "", anythingElse: "" })).toBe(true);
  });
});
