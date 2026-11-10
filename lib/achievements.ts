/**
 * Decide which achievements to toast.
 * Before hydration the saved list is empty, so that pass must not count as
 * "already seen" — otherwise every stored achievement looks new on the next pass.
 */
export function partitionAchievements<T extends { id: string }>(
  seen: ReadonlySet<string>,
  achievements: readonly T[],
  hydrated: boolean,
  initialized: boolean
): { announce: T[]; markSeen: T[]; initialized: boolean } {
  if (!hydrated) {
    return { announce: [], markSeen: [], initialized: false };
  }
  const unseen = achievements.filter((achievement) => !seen.has(achievement.id));
  if (!initialized) {
    return { announce: [], markSeen: unseen, initialized: true };
  }
  return { announce: unseen, markSeen: unseen, initialized: true };
}
