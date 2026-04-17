"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useScriptLab } from "@/lib/ScriptLabProvider";
import { typeIcon } from "@/lib/gss";
import { xpForRun } from "@/lib/gamification";

type CommitEvent =
  | {
      type: "run";
      timestamp: string;
      scriptTitle: string;
      scriptType: string;
      duration: number;
      completed: boolean;
      xp: number;
    }
  | {
      type: "achievement";
      timestamp: string;
      title: string;
      description: string;
    }
  | {
      type: "build-shipped";
      timestamp: string;
      date: string;
      executionFidelity?: number;
      reflection?: {
        wins: string;
        challenges: string;
        tomorrowFocus: string;
      };
    }
  | {
      type: "profile-created";
      timestamp: string;
      name: string;
    };

export default function HistoryPage() {
  const { state, hydrated } = useScriptLab();
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "runs" | "achievements" | "builds">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!hydrated) return;
    if (!state.profile) router.push("/onboard");
  }, [hydrated, state.profile, router]);

  const commitLog = useMemo(() => {
    const events: CommitEvent[] = [];

    // Add profile creation
    if (state.profile) {
      events.push({
        type: "profile-created",
        timestamp: state.profile.createdAt,
        name: state.profile.name,
      });
    }

    // Add all script runs
    state.scripts.forEach((script) => {
      script.runs.forEach((run) => {
        events.push({
          type: "run",
          timestamp: run.at,
          scriptTitle: script.title,
          scriptType: script.type,
          duration: run.durationMin,
          completed: run.completed,
          xp: run.completed ? xpForRun(script, run.durationMin) : 0,
        });
      });
    });

    // Add achievements
    state.achievements.forEach((achievement) => {
      events.push({
        type: "achievement",
        timestamp: achievement.unlockedAt,
        title: achievement.title,
        description: achievement.description,
      });
    });

    // Add shipped builds
    state.executables
      .filter((exe) => exe.status === "complete" && exe.completedAt)
      .forEach((exe) => {
        const plannedScripts = exe.slots
          .filter((s) => s.scriptId)
          .map((s) => s.scriptId as string);
        const completedScripts = exe.completedScriptIds || [];
        const executionFidelity =
          plannedScripts.length > 0
            ? Math.round(
                (completedScripts.filter((id) => plannedScripts.includes(id))
                  .length /
                  plannedScripts.length) *
                  100
              )
            : 0;

        events.push({
          type: "build-shipped",
          timestamp: exe.completedAt!,
          date: exe.date,
          executionFidelity,
          reflection: exe.reflection,
        });
      });

    // Sort by timestamp (newest first)
    events.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return events;
  }, [state]);

  const filteredLog = useMemo(() => {
    let filtered = commitLog;

    // Apply type filter
    if (filter !== "all") {
      filtered = filtered.filter((event) => {
        if (filter === "runs") return event.type === "run";
        if (filter === "achievements") return event.type === "achievement";
        if (filter === "builds") return event.type === "build-shipped";
        return true;
      });
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((event) => {
        if (event.type === "run") {
          return event.scriptTitle.toLowerCase().includes(query);
        }
        if (event.type === "achievement") {
          return (
            event.title.toLowerCase().includes(query) ||
            event.description.toLowerCase().includes(query)
          );
        }
        if (event.type === "build-shipped") {
          return (
            event.date.includes(query) ||
            event.reflection?.wins.toLowerCase().includes(query) ||
            event.reflection?.challenges.toLowerCase().includes(query) ||
            event.reflection?.tomorrowFocus.toLowerCase().includes(query)
          );
        }
        return true;
      });
    }

    return filtered;
  }, [commitLog, filter, searchQuery]);

  const stats = useMemo(() => {
    return {
      totalRuns: commitLog.filter((e) => e.type === "run").length,
      completedRuns: commitLog.filter(
        (e) => e.type === "run" && e.completed
      ).length,
      totalAchievements: commitLog.filter((e) => e.type === "achievement")
        .length,
      totalBuilds: commitLog.filter((e) => e.type === "build-shipped").length,
    };
  }, [commitLog]);

  if (!hydrated || !state.profile) return null;

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "today";
    if (diffDays === 1) return "yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const formatFullDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <button
        onClick={() => router.push("/dashboard")}
        className="text-sm text-muted hover:text-matrix transition-colors mb-4 flex items-center gap-1"
      >
        ← Back to Dashboard
      </button>
      <div className="mb-6">
        <h1 className="text-2xl text-matrix crt-text font-bold mb-1">
          /history — Commit Log
        </h1>
        <div className="text-xs text-muted">
          A chronological log of your life's commits
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="panel p-3 text-center">
          <div className="text-xs text-muted mb-1">Total Events</div>
          <div className="text-xl font-bold text-matrix">
            {commitLog.length}
          </div>
        </div>
        <div className="panel p-3 text-center">
          <div className="text-xs text-muted mb-1">Runs</div>
          <div className="text-xl font-bold text-matrix">
            {stats.completedRuns}
          </div>
        </div>
        <div className="panel p-3 text-center">
          <div className="text-xs text-muted mb-1">Achievements</div>
          <div className="text-xl font-bold text-matrix">
            {stats.totalAchievements}
          </div>
        </div>
        <div className="panel p-3 text-center">
          <div className="text-xs text-muted mb-1">Builds Shipped</div>
          <div className="text-xl font-bold text-matrix">
            {stats.totalBuilds}
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="panel p-4 mb-4 flex flex-wrap gap-3 items-center">
        <div className="flex gap-2">
          {(["all", "runs", "achievements", "builds"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`btn !py-1 !px-3 text-xs capitalize ${
                filter === f ? "btn-primary" : ""
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search commits..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 min-w-[200px] !py-1 text-sm"
        />
      </div>

      {/* Commit Log */}
      <div className="space-y-1">
        {filteredLog.length === 0 ? (
          <div className="panel p-8 text-center text-muted">
            No commits found. {searchQuery && "Try adjusting your search."}
          </div>
        ) : (
          filteredLog.map((event, idx) => (
            <div
              key={idx}
              className="panel p-4 hover:shadow-glow-sm transition-shadow border-l-4"
              style={{
                borderLeftColor:
                  event.type === "achievement"
                    ? "#00ff9c"
                    : event.type === "build-shipped"
                    ? "#4dffbc"
                    : event.type === "run" && event.completed
                    ? "#00b36b"
                    : event.type === "run"
                    ? "#ff3860"
                    : "#6b8377",
              }}
            >
              {/* Profile Created */}
              {event.type === "profile-created" && (
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-matrix font-mono font-bold">
                      commit
                    </span>
                    <span className="text-muted text-xs">
                      {formatTimestamp(event.timestamp)}
                    </span>
                  </div>
                  <div className="text-sm text-ink/90">
                    🎬 <span className="font-semibold">Profile Created:</span>{" "}
                    {event.name} joined ScriptLabOS
                  </div>
                  <div className="text-xs text-muted mt-1">
                    {formatFullDate(event.timestamp)}
                  </div>
                </div>
              )}

              {/* Script Run */}
              {event.type === "run" && (
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-matrix font-mono font-bold">
                      {event.completed ? "commit" : "abort"}
                    </span>
                    <span className="text-muted text-xs">
                      {formatTimestamp(event.timestamp)}
                    </span>
                    {event.completed && (
                      <span className="text-xs text-matrix">
                        +{event.xp} XP
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-ink/90">
                    {typeIcon[event.scriptType as keyof typeof typeIcon]}{" "}
                    <span className="font-semibold">{event.scriptTitle}</span> ·{" "}
                    {event.duration}m
                    {!event.completed && (
                      <span className="text-virus ml-2">(bailed)</span>
                    )}
                  </div>
                  <div className="text-xs text-muted mt-1">
                    {formatFullDate(event.timestamp)}
                  </div>
                </div>
              )}

              {/* Achievement */}
              {event.type === "achievement" && (
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-matrix font-mono font-bold">
                      achievement
                    </span>
                    <span className="text-muted text-xs">
                      {formatTimestamp(event.timestamp)}
                    </span>
                  </div>
                  <div className="text-sm text-ink/90">
                    ★ <span className="font-semibold text-matrix">{event.title}</span>
                  </div>
                  <div className="text-xs text-muted mt-1">
                    {event.description}
                  </div>
                  <div className="text-xs text-muted mt-1">
                    {formatFullDate(event.timestamp)}
                  </div>
                </div>
              )}

              {/* Build Shipped */}
              {event.type === "build-shipped" && (
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-matrix font-mono font-bold">
                      merge
                    </span>
                    <span className="text-muted text-xs">
                      {formatTimestamp(event.timestamp)}
                    </span>
                    {event.executionFidelity !== undefined && (
                      <span
                        className={`text-xs font-bold ${
                          event.executionFidelity >= 80
                            ? "text-matrix"
                            : event.executionFidelity >= 50
                            ? "text-amber-bug"
                            : "text-virus"
                        }`}
                      >
                        {event.executionFidelity}% fidelity
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-ink/90 mb-2">
                    🚀 <span className="font-semibold">Daily Build Shipped:</span>{" "}
                    {event.date}
                  </div>
                  {event.reflection && (
                    <div className="text-xs text-muted space-y-1 pl-4 border-l border-matrix/20">
                      <div>
                        <span className="text-matrix">Wins:</span>{" "}
                        {event.reflection.wins}
                      </div>
                      <div>
                        <span className="text-amber-bug">Challenges:</span>{" "}
                        {event.reflection.challenges}
                      </div>
                      <div>
                        <span className="text-cyan-300">Tomorrow:</span>{" "}
                        {event.reflection.tomorrowFocus}
                      </div>
                    </div>
                  )}
                  <div className="text-xs text-muted mt-1">
                    {formatFullDate(event.timestamp)}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {filteredLog.length > 0 && (
        <div className="mt-6 panel p-4 text-center text-xs text-muted">
          <div className="mb-1">
            Showing {filteredLog.length} of {commitLog.length} commits
          </div>
          <div className="text-[10px]">
            Your life's changelog · Growing ourselves and contributing to others
          </div>
        </div>
      )}
    </div>
  );
}
