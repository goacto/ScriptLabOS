import type { GssFile, GssType } from "./types";

export function uid(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  );
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function makeGss(
  partial: Partial<GssFile> & { title: string; type: GssType }
): GssFile {
  const now = new Date().toISOString();
  return {
    id: uid(),
    name: partial.name ?? slugify(partial.title),
    title: partial.title,
    type: partial.type,
    durationMin: partial.durationMin ?? 25,
    intent: partial.intent ?? "",
    steps: partial.steps ?? [],
    tags: partial.tags ?? [],
    linkedValue: partial.linkedValue,
    createdAt: partial.createdAt ?? now,
    updatedAt: now,
    runs: partial.runs ?? [],
  };
}

export const typeLabel: Record<GssType, string> = {
  baseline: "Baseline OS",
  update: "Update",
  upgrade: "OS Upgrade",
  bug: "Bug / Pop",
  virus: "Virus",
  package: "Package",
};

export const typeIcon: Record<GssType, string> = {
  baseline: "[OS]",
  update: "[UPD]",
  upgrade: "[UP+]",
  bug: "[BUG]",
  virus: "[VIR]",
  package: "[PKG]",
};

export const typeColor: Record<GssType, string> = {
  baseline: "text-matrix",
  update: "text-cyan-300",
  upgrade: "text-emerald-300",
  bug: "text-amber-bug",
  virus: "text-virus",
  package: "text-ink",
};
