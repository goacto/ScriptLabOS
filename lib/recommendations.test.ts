import { describe, it, expect } from "vitest";
import { recommendTemplates } from "./recommendations";
import type { Profile } from "./types";

const profile = (overrides: Partial<Profile> = {}): Profile => ({
  name: "neo",
  wakeUps: [],
  values: [],
  goals: [],
  createdAt: "x",
  ...overrides,
});

describe("recommendTemplates", () => {
  it("returns nothing when the profile has no tokens", () => {
    expect(recommendTemplates(profile(), new Set())).toEqual([]);
  });

  it("matches a template via wake-up keywords", () => {
    const matches = recommendTemplates(
      profile({
        wakeUps: [
          {
            id: "1",
            text: "I wake up to read every morning so that I learn so that I grow.",
          },
        ],
      }),
      new Set()
    );
    const titles = matches.map((m) => m.template.title);
    expect(titles).toContain("Deep Read");
  });

  it("excludes templates the user already owns by title", () => {
    const owned = new Set(["Deep Read"]);
    const matches = recommendTemplates(
      profile({
        wakeUps: [{ id: "1", text: "I read every morning" }],
      }),
      owned
    );
    expect(matches.find((m) => m.template.title === "Deep Read")).toBeUndefined();
  });

  it("scores higher when more tokens match", () => {
    const matches = recommendTemplates(
      profile({
        values: ["focus", "learning"],
        wakeUps: [{ id: "1", text: "I read deeply for practice" }],
      }),
      new Set()
    );
    expect(matches[0].score).toBeGreaterThanOrEqual(matches[matches.length - 1].score);
  });
});
