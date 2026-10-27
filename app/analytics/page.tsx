"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import { useScriptLab } from "@/lib/ScriptLabProvider";
import { formatMonthDay, instantToLocalDate, lastNDates } from "@/lib/dates";
import { xpForRun } from "@/lib/gamification";
import { isRelapse } from "@/lib/cleanStreak";

export default function AnalyticsPage() {
  const { state, hydrated } = useScriptLab();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    if (!state.profile) router.push("/onboard");
  }, [hydrated, state.profile, router]);

  const analytics = useMemo(() => {
    const last30Days = lastNDates(30);

    const dailyStats = last30Days.map((date) => {
      const dayRuns = state.scripts.flatMap((script) =>
        script.runs
          .filter((run) => instantToLocalDate(run.at) === date)
          .map((run) => ({
            ...run,
            scriptType: script.type,
            scriptTitle: script.title,
            xp: run.completed ? xpForRun(script, run.durationMin) : 0,
          }))
      );

      const exe = state.executables.find((e) => e.date === date);

      const sessionRuns = dayRuns.filter((r) => !isRelapse(r));
      const relapseRuns = dayRuns.filter(isRelapse);

      return {
        date,
        totalRuns: sessionRuns.length,
        completedRuns: sessionRuns.filter((r) => r.completed).length,
        bailedRuns: sessionRuns.filter((r) => !r.completed).length,
        xpEarned: dayRuns.reduce((sum, r) => sum + r.xp, 0),
        bugRelapses: relapseRuns.filter((r) => r.scriptType === "bug").length,
        virusRelapses: relapseRuns.filter((r) => r.scriptType === "virus").length,
        buildStatus: exe?.status || "none",
      };
    });

    const totalStats = {
      totalCompleted: dailyStats.reduce((sum, d) => sum + d.completedRuns, 0),
      totalBailed: dailyStats.reduce((sum, d) => sum + d.bailedRuns, 0),
      totalXP: dailyStats.reduce((sum, d) => sum + d.xpEarned, 0),
      totalBugRelapses: dailyStats.reduce((sum, d) => sum + d.bugRelapses, 0),
      totalVirusRelapses: dailyStats.reduce((sum, d) => sum + d.virusRelapses, 0),
      avgXPPerDay:
        Math.round(
          dailyStats.reduce((sum, d) => sum + d.xpEarned, 0) / 30
        ) || 0,
      completedBuilds: dailyStats.filter((d) => d.buildStatus === "complete")
        .length,
    };

    const maxXP = Math.max(...dailyStats.map((d) => d.xpEarned), 1);

    return { dailyStats, totalStats, maxXP };
  }, [state.scripts, state.executables]);

  if (!hydrated || !state.profile) return null;

  return (
    <>
    <NavBar />
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl text-matrix crt-text font-bold mb-1">
        /analytics — Performance Dashboard
      </h1>
      <div className="text-xs text-muted mb-6">
        Track your growth over the last 30 days
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="panel p-4">
          <div className="text-xs text-muted mb-1">Completed Sessions</div>
          <div className="text-2xl font-bold text-matrix">
            {analytics.totalStats.totalCompleted}
          </div>
          <div className="text-xs text-muted mt-1">
            {analytics.totalStats.totalBailed} bailed
          </div>
        </div>

        <div className="panel p-4">
          <div className="text-xs text-muted mb-1">Total XP (30d)</div>
          <div className="text-2xl font-bold text-matrix">
            {analytics.totalStats.totalXP}
          </div>
          <div className="text-xs text-muted mt-1">
            ~{analytics.totalStats.avgXPPerDay} avg/day
          </div>
        </div>

        <div className="panel p-4">
          <div className="text-xs text-muted mb-1">Bug Relapses Logged</div>
          <div className="text-2xl font-bold text-amber-bug">
            {analytics.totalStats.totalBugRelapses}
          </div>
          <div className="text-xs text-muted mt-1">times you noticed a bug run</div>
        </div>

        <div className="panel p-4">
          <div className="text-xs text-muted mb-1">Virus Relapses Logged</div>
          <div className="text-2xl font-bold text-virus">
            {analytics.totalStats.totalVirusRelapses}
          </div>
          <div className="text-xs text-muted mt-1">
            times you noticed a virus run
          </div>
        </div>
      </div>

      {/* XP Chart */}
      <div className="panel p-6 mb-6">
        <div className="mb-4">
          <h2 className="text-lg text-matrix font-bold">Daily XP Earned</h2>
          <p className="text-xs text-muted">Last 30 days</p>
        </div>

        <div className="flex items-end justify-between gap-1 h-48">
          {analytics.dailyStats.map((day, idx) => {
            const height = (day.xpEarned / analytics.maxXP) * 100;
            const isToday = idx === analytics.dailyStats.length - 1;

            return (
              <div
                key={day.date}
                className="flex-1 flex flex-col justify-end group relative"
              >
                <div
                  className={`w-full transition-all ${
                    day.xpEarned > 0
                      ? "bg-matrix hover:bg-matrix-dim"
                      : "bg-bg-elev"
                  } ${isToday ? "ring-2 ring-matrix" : ""}`}
                  style={{ height: `${Math.max(height, 2)}%` }}
                />
                {/* Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-bg-elev border border-matrix/30 rounded px-2 py-1 text-xs whitespace-nowrap pointer-events-none z-10">
                  <div className="text-matrix font-bold">
                    {formatMonthDay(day.date)}
                  </div>
                  <div className="text-ink/90">{day.xpEarned} XP</div>
                  <div className="text-muted text-[10px]">
                    {day.completedRuns} sessions
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between mt-2 text-[10px] text-muted">
          <span>
            {formatMonthDay(analytics.dailyStats[0].date)}
          </span>
          <span>Today</span>
        </div>
      </div>

      {/* Build Quality */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="panel p-6">
          <h2 className="text-lg text-matrix font-bold mb-4">
            Session Completion Rate
          </h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted">Completed</span>
                <span className="text-matrix">
                  {analytics.totalStats.totalCompleted}
                </span>
              </div>
              <div className="h-2 bg-bg-elev rounded-full overflow-hidden">
                <div
                  className="h-full bg-matrix"
                  style={{
                    width: `${
                      ((analytics.totalStats.totalCompleted /
                        (analytics.totalStats.totalCompleted +
                          analytics.totalStats.totalBailed)) *
                        100) ||
                      0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted">Bailed</span>
                <span className="text-virus">
                  {analytics.totalStats.totalBailed}
                </span>
              </div>
              <div className="h-2 bg-bg-elev rounded-full overflow-hidden">
                <div
                  className="h-full bg-virus"
                  style={{
                    width: `${
                      ((analytics.totalStats.totalBailed /
                        (analytics.totalStats.totalCompleted +
                          analytics.totalStats.totalBailed)) *
                        100) ||
                      0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-matrix/10">
              <div className="text-sm text-muted">Success Rate</div>
              <div className="text-3xl font-bold text-matrix">
                {Math.round(
                  ((analytics.totalStats.totalCompleted /
                    (analytics.totalStats.totalCompleted +
                      analytics.totalStats.totalBailed)) *
                    100) ||
                    0
                )}
                %
              </div>
            </div>
          </div>
        </div>

        <div className="panel p-6">
          <h2 className="text-lg text-matrix font-bold mb-4">
            Daily Builds Shipped
          </h2>
          <div className="text-center">
            <div className="text-5xl font-bold text-matrix mb-2">
              {analytics.totalStats.completedBuilds}
            </div>
            <div className="text-sm text-muted">out of 30 days</div>
            <div className="mt-4 pt-4 border-t border-matrix/10">
              <div className="text-xs text-muted mb-2">Consistency Score</div>
              <div className="text-2xl font-bold text-matrix">
                {Math.round(
                  (analytics.totalStats.completedBuilds / 30) * 100
                )}
                %
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
