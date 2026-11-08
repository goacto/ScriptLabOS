import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { TEMPLATES } from "./templates";
import {
  GOACTO_LINE,
  SKIP_SETUP_LABEL,
  SKIP_VALUES_LABEL,
  STEP_ONE_LEAD,
  SETUP_SCRIPTS_LABEL,
  VALUE_CHIPS,
  VALUE_PICK_LIMIT,
  blankSkippedProfile,
  buildSampleExecutable,
  buildSeedScripts,
  toggleChip,
  unownedTemplates,
} from "./onboarding";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function src(rel: string) {
  return readFileSync(resolve(root, rel), "utf8");
}

describe("sample day", () => {
  const scripts = buildSeedScripts();

  it("loads every curated seed template", () => {
    expect(scripts.map((script) => script.title)).toEqual(
      TEMPLATES.map((template) => template.title)
    );
  });

  it("places the morning and evening starters on a 05:00–22:00 day", () => {
    const day = buildSampleExecutable(scripts, "2026-11-05", "day-1");
    expect(day.date).toBe("2026-11-05");
    expect(day.status).toBe("draft");
    expect(day.slots).toHaveLength(18);
    expect(day.slots[0].time).toBe("05:00");
    expect(day.slots[17].time).toBe("22:00");

    const at = (time: string) => day.slots.find((slot) => slot.time === time);
    const titleAt = (time: string) =>
      scripts.find((script) => script.id === at(time)?.scriptId)?.title;

    expect(titleAt("07:00")).toBe("Morning Breathwork");
    expect(titleAt("08:00")).toBe("Deep Read");
    expect(titleAt("21:00")).toBe("Evening Reflection");
    expect(at("06:00")?.scriptId).toBeUndefined();
  });

  it("skips with an empty profile so Home can open", () => {
    expect(blankSkippedProfile("t")).toEqual({
      name: "",
      wakeUps: [],
      values: [],
      goals: [],
      createdAt: "t",
    });
  });
});

describe("values chips", () => {
  it("picks up to three and lets a chip come back off", () => {
    const first = toggleChip([], VALUE_CHIPS[0]);
    const three = VALUE_CHIPS.slice(0, VALUE_PICK_LIMIT).reduce(
      (selected, chip) => toggleChip(selected, chip),
      [] as string[]
    );
    expect(first).toEqual([VALUE_CHIPS[0]]);
    expect(three).toHaveLength(VALUE_PICK_LIMIT);
    expect(toggleChip(three, VALUE_CHIPS[3])).toEqual(three);
    expect(toggleChip(three, VALUE_CHIPS[0])).toEqual([
      VALUE_CHIPS[1],
      VALUE_CHIPS[2],
    ]);
  });
});

describe("unowned templates", () => {
  it("hides titles already in the library", () => {
    const scripts = buildSeedScripts().slice(0, 1);
    const left = unownedTemplates(scripts);
    expect(left.some((template) => template.title === scripts[0].title)).toBe(
      false
    );
    expect(left).toHaveLength(TEMPLATES.length - 1);
  });
});

describe("first-minute copy", () => {
  it("uses the plain lead, the skip label, and a lowercase and", () => {
    expect(STEP_ONE_LEAD).toBe(
      "Your day runs on habits. Write the ones you want, and run them each morning."
    );
    expect(SKIP_SETUP_LABEL).toBe("Skip setup, show me a sample day");
    expect(SETUP_SCRIPTS_LABEL).toBe("Set up my scripts");
    expect(SKIP_VALUES_LABEL).toBe("skip for now");
    expect(GOACTO_LINE).toBe("Growing Ourselves and Contributing To Others");
    expect(GOACTO_LINE).not.toContain("And");
  });

  it("wires those lines into the screens and drops the extra splash tap for new users", () => {
    const wizard = src("components/OnboardingWizard.tsx");
    const splash = src("components/Splash.tsx");
    const settings = src("app/settings/page.tsx");
    const setup = src("components/SetupScripts.tsx");

    expect(wizard).toContain("STEP_ONE_LEAD");
    expect(wizard).toContain("SKIP_SETUP_LABEL");
    expect(wizard).toContain("SKIP_VALUES_LABEL");
    expect(wizard).toContain("GOACTO_LINE");
    expect(wizard).toContain("[OS]");
    expect(wizard).not.toContain("Seed Templates");

    expect(splash).toContain("GOACTO_LINE");
    expect(splash).toContain('router.replace("/onboard")');
    expect(splash).not.toContain("And Contributing");

    expect(settings).toContain("GOACTO_LINE");
    expect(settings).toContain("<SetupScripts />");
    expect(settings).not.toContain("And Contributing");
    expect(setup).toContain("SETUP_SCRIPTS_LABEL");
  });
});
