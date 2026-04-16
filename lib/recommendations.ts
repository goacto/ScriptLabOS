import { TEMPLATES, type GssTemplate } from "./templates";
import type { Profile } from "./types";

const STOPWORDS = new Set([
  "i",
  "wake",
  "up",
  "to",
  "so",
  "that",
  "the",
  "a",
  "an",
  "and",
  "or",
  "of",
  "for",
  "on",
  "in",
  "my",
  "me",
  "can",
  "have",
  "be",
  "is",
  "am",
  "with",
  "by",
  "it",
  "this",
  "as",
  "at",
]);

function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t));
}

function profileTokens(profile: Profile): Set<string> {
  const t = new Set<string>();
  profile.wakeUps.forEach((w) => tokens(w.text).forEach((x) => t.add(x)));
  profile.values.forEach((v) => tokens(v).forEach((x) => t.add(x)));
  profile.goals.forEach((g) => tokens(g).forEach((x) => t.add(x)));
  return t;
}

function templateTokens(t: GssTemplate): string[] {
  return [
    ...t.tags.flatMap(tokens),
    ...tokens(t.title),
    ...tokens(t.intent),
  ];
}

export interface TemplateMatch {
  template: GssTemplate;
  score: number;
  matched: string[];
}

export function recommendTemplates(
  profile: Profile,
  ownedTemplateTitles: Set<string>,
  limit = 4
): TemplateMatch[] {
  const userTokens = profileTokens(profile);
  if (!userTokens.size) return [];
  const scored: TemplateMatch[] = TEMPLATES.filter(
    (t) => !ownedTemplateTitles.has(t.title) && t.durationMin > 0
  )
    .map((t) => {
      const matched: string[] = [];
      templateTokens(t).forEach((tok) => {
        if (userTokens.has(tok) && !matched.includes(tok)) matched.push(tok);
      });
      return { template: t, score: matched.length, matched };
    })
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}
