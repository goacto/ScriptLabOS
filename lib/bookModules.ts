/**
 * Free book-chapter modules (ChapterIntegration spec v0.1, skeleton).
 * Every module is free. There is no paywall, tier check or upgrade prompt here.
 * Copy is written in our own words, not quoted from the chapters.
 * Only ch01 has content (a SAMPLE); the rest are listed as "coming soon".
 */
export interface BookStep {
  id: string;
  title: string;
  prompts: { key: string; label: string }[];
}

export interface BookModule {
  id: string;
  chapter: number;
  title: string;
  free: true;
  sample?: boolean;
  intro?: string;
  stop?: string;
  steps: BookStep[];
}

const twoPrompts = (k: string) => [
  { key: `${k}.recent`, label: "The last time it showed up: where you were, what happened, and what you noticed in your body." },
  { key: `${k}.older`, label: "Why this reaction might be older than the person you are now:" },
];

export const BOOK_MODULES: BookModule[] = [
  {
    id: "ch01-repo",
    chapter: 1,
    title: "The Repo You Didn't Write",
    free: true,
    sample: true,
    intro:
      "Pick three reactions that seem to fire before you decide anything: a flinch, an automatic yes, and a sudden coldness. Just describe them. No fixing, no judging, no guessing where they came from.",
    stop: "That's the whole exercise. Keep the three descriptions somewhere you can find them.",
    steps: [
      { id: "flinch", title: "The flinch", prompts: twoPrompts("flinch") },
      { id: "yes", title: "The automatic yes", prompts: twoPrompts("yes") },
      { id: "coldness", title: "The sudden coldness", prompts: twoPrompts("coldness") },
    ],
  },
  ...[
    "The Runtime Is Attention",
    "Reading the Commit History",
    "Rename Honestly",
    "Find the Copy-Paste",
    "Follow the Call",
    "Branch Before You Delete",
    "Override One Line",
    "What the Room Did",
    "What Runs Becomes Your Life",
    "You Are Not the Codebase",
    "Open a Pull Request",
    "What They Meet",
  ].map((title, i) => ({
    id: `ch${String(i + 2).padStart(2, "0")}`,
    chapter: i + 2,
    title,
    free: true as const,
    steps: [],
  })),
];

export const BOOK_KEY = "scriptlab:book:v1";

export type BookAnswers = Record<string, Record<string, string>>;

export function getModule(id: string): BookModule | undefined {
  return BOOK_MODULES.find((m) => m.id === id);
}

export function isAvailable(m: BookModule): boolean {
  return m.steps.length > 0;
}

/** Answers stay on this device (localStorage only). */
export function loadAnswers(store: Pick<Storage, "getItem"> | undefined): BookAnswers {
  try {
    return JSON.parse(store?.getItem(BOOK_KEY) ?? "{}") ?? {};
  } catch {
    return {};
  }
}

export function saveAnswer(
  store: Pick<Storage, "getItem" | "setItem"> | undefined,
  moduleId: string,
  key: string,
  value: string
): BookAnswers {
  const all = loadAnswers(store);
  all[moduleId] = { ...(all[moduleId] ?? {}), [key]: value };
  store?.setItem(BOOK_KEY, JSON.stringify(all));
  return all;
}
