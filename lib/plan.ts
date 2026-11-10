import type { ExecutableSlot, Package } from "./types";

/** Script ids a day plan includes, counting each script inside a package once. */
export function plannedScriptIds(
  slots: Pick<ExecutableSlot, "scriptId" | "packageId">[],
  packages: Pick<Package, "id" | "scriptIds">[]
): string[] {
  const byPackage = new Map(packages.map((pkg) => [pkg.id, pkg.scriptIds]));
  const ids = new Set<string>();
  for (const slot of slots) {
    if (slot.scriptId) ids.add(slot.scriptId);
    if (slot.packageId) {
      const members = byPackage.get(slot.packageId);
      if (members) members.forEach((id) => ids.add(id));
    }
  }
  return Array.from(ids);
}

/** Share of planned scripts that were completed. 0 when nothing was planned. */
export function fidelityPercent(
  plannedIds: string[],
  completedIds: string[]
): number {
  const planned = new Set(plannedIds);
  if (planned.size === 0) return 0;
  const done = new Set(completedIds.filter((id) => planned.has(id)));
  return Math.round((done.size / planned.size) * 100);
}
