import type { Executable, GssFile, Profile } from "./types";
import { uid } from "./gss";
import { EXAMPLE_WAKE_UPS, TEMPLATES, templateToGss } from "./templates";

/** Visible GOACTO line. The conjunction stays lowercase. */
export const GOACTO_LINE = "Growing Ourselves and Contributing To Others";

export const STEP_ONE_LEAD =
  "Your day runs on habits. Write the ones you want, and run them each morning.";

export const SKIP_SETUP_LABEL = "Skip setup, show me a sample day";

export const SETUP_SCRIPTS_LABEL = "Set up my scripts";

export const SKIP_VALUES_LABEL = "skip for now";

/** Tap targets on the values step. Pick three. */
export const VALUE_CHIPS = [
  "Growth",
  "Courage",
  "Integrity",
  "Health",
  "Creativity",
  "Family",
  "Freedom",
  "Excellence",
] as const;

export const VALUE_PICK_LIMIT = 3;

/** Same window Day Builder renders: 05:00–22:00. */
const SAMPLE_DAY_START_HOUR = 5;
const SAMPLE_DAY_HOURS = 18;

/** Starters placed on the sample day. Titles match `TEMPLATES`. */
const SAMPLE_DAY_PLAN: { title: string; hour: number }[] = [
  { title: "Morning Breathwork", hour: 7 },
  { title: "Deep Read", hour: 8 },
  { title: "Evening Reflection", hour: 21 },
];

export function toggleChip(
  selected: string[],
  value: string,
  limit = VALUE_PICK_LIMIT
): string[] {
  if (selected.includes(value)) return selected.filter((item) => item !== value);
  if (selected.length >= limit) return selected;
  return [...selected, value];
}

export function blankSkippedProfile(createdAt: string): Profile {
  return {
    name: "",
    wakeUps: [],
    values: [],
    goals: [],
    createdAt,
  };
}

/** Every curated seed template, as library scripts. */
export function buildSeedScripts(): GssFile[] {
  return TEMPLATES.map((template) => templateToGss(template));
}

export function hourLabel(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

/** A full day grid with the starter habits sitting on a morning and evening. */
export function buildSampleExecutable(
  scripts: GssFile[],
  date: string,
  id: string = uid()
): Executable {
  const byTitle = new Map(scripts.map((script) => [script.title, script]));
  const placed = new Map<string, string>();
  for (const slot of SAMPLE_DAY_PLAN) {
    const script = byTitle.get(slot.title);
    if (script) placed.set(hourLabel(slot.hour), script.id);
  }
  const slots = Array.from({ length: SAMPLE_DAY_HOURS }, (_, index) => {
    const time = hourLabel(SAMPLE_DAY_START_HOUR + index);
    const scriptId = placed.get(time);
    return scriptId ? { time, scriptId } : { time };
  });
  return { id, date, slots, status: "draft" };
}

export function unownedTemplates(scripts: GssFile[]) {
  const owned = new Set(scripts.map((script) => script.title));
  return TEMPLATES.filter((template) => !owned.has(template.title));
}

export { EXAMPLE_WAKE_UPS };
