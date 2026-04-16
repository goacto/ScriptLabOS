import type { GssFile, GssType } from "./types";
import { makeGss } from "./gss";

export interface GssTemplate {
  id: string;
  title: string;
  type: GssType;
  durationMin: number;
  intent: string;
  steps: string[];
  tags: string[];
}

export const TEMPLATES: GssTemplate[] = [
  {
    id: "tpl-morning-breath",
    title: "Morning Breathwork",
    type: "baseline",
    durationMin: 10,
    intent: "Boot the nervous system before caffeine.",
    steps: [
      "Sit upright, eyes closed",
      "Box breathing 4-4-4-4 x 10 rounds",
      "Set one intention for the day",
    ],
    tags: ["morning", "breath", "reset"],
  },
  {
    id: "tpl-hydrate",
    title: "Hydrate + Stretch",
    type: "baseline",
    durationMin: 5,
    intent: "Top up water and unlock the spine.",
    steps: [
      "500ml water",
      "Cat-cow x 10",
      "Standing forward fold x 30s",
    ],
    tags: ["body", "morning"],
  },
  {
    id: "tpl-evening-reflect",
    title: "Evening Reflection",
    type: "baseline",
    durationMin: 15,
    intent: "Commit the day's log to memory.",
    steps: [
      "List 3 wins",
      "List 1 bug to patch tomorrow",
      "Gratitude x 3",
    ],
    tags: ["journal", "evening"],
  },
  {
    id: "tpl-deep-read",
    title: "Deep Read",
    type: "update",
    durationMin: 25,
    intent: "Install new information into long-term storage.",
    steps: [
      "Phone on airplane mode",
      "Read 25 minutes",
      "Write one paragraph summary",
    ],
    tags: ["learning", "focus"],
  },
  {
    id: "tpl-skill-drill",
    title: "Skill Drill",
    type: "update",
    durationMin: 25,
    intent: "Deliberate practice on a single skill.",
    steps: [
      "Name the skill",
      "Pick one micro-drill",
      "Run the drill for 25 min with focused attention",
    ],
    tags: ["practice", "deliberate"],
  },
  {
    id: "tpl-identity-install",
    title: "Identity Install",
    type: "upgrade",
    durationMin: 25,
    intent: "Upgrade the operator, not just the scripts.",
    steps: [
      "Write 'I am a person who ___'",
      "List 3 evidences from this week",
      "Write tomorrow's proof",
    ],
    tags: ["identity", "paradigm"],
  },
  {
    id: "tpl-doomscroll",
    title: "Doomscroll (Bug Example)",
    type: "bug",
    durationMin: 0,
    intent: "Example bug: identify, then patch or delete.",
    steps: [
      "When does it fire?",
      "What need is it trying to meet?",
      "Replace with which baseline .gss?",
    ],
    tags: ["bug", "example"],
  },
  {
    id: "tpl-not-enough",
    title: "\"I'm not enough\" (Virus Example)",
    type: "virus",
    durationMin: 0,
    intent: "Example limiting belief: quarantine and overwrite.",
    steps: [
      "Name the belief verbatim",
      "Write its origin story",
      "Write the overwrite statement",
    ],
    tags: ["virus", "example"],
  },
];

export function templateToGss(t: GssTemplate): GssFile {
  return makeGss({
    title: t.title,
    type: t.type,
    durationMin: t.durationMin,
    intent: t.intent,
    steps: t.steps,
    tags: t.tags,
  });
}

export const EXAMPLE_WAKE_UPS: string[] = [
  "I wake up to build ScriptLab so that I can help others author their own lives so that humanity runs on better scripts.",
  "I wake up to train my body so that I have the energy to show up so that my family thrives.",
  "I wake up to learn every day so that I compound knowledge so that my ceiling becomes someone else's floor.",
];
