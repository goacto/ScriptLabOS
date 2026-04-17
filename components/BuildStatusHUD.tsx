"use client";

import Link from "next/link";
import { useScriptLab } from "@/lib/ScriptLabProvider";
import XPBar from "./XPBar";
import { todayStr } from "@/lib/gamification";

export default function BuildStatusHUD() {
  const { state, dispatch } = useScriptLab();
  const today = todayStr();
  const todaysExe = state.executables.find((e) => e.date === today);
  const status = todaysExe?.status ?? "draft";

  const bugs = state.scripts.filter((s) => s.type === "bug").length;
  const viruses = state.scripts.filter((s) => s.type === "virus").length;
  const updates = state.scripts.filter((s) => s.type === "update").length;
  const baseline = state.scripts.filter((s) => s.type === "baseline").length;

  const statusColor =
    status === "passed"
      ? "text-matrix"
      : status === "failed"
      ? "text-virus"
      : status === "running"
      ? "text-amber-bug"
      : "text-muted";

  const wakeUps = state.profile?.wakeUps ?? [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div>
        <div className="text-xs text-muted uppercase tracking-[0.4em]">
          Good morning, {state.profile?.name ?? "developer"}.
        </div>
        <h1 className="text-3xl text-matrix crt-text font-bold">
          /dev/self · build status
        </h1>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="panel p-5">
          <div className="text-xs text-muted mb-1">today's build</div>
          <div className={`text-2xl font-bold ${statusColor}`}>
            {status.toUpperCase()}
          </div>
          <div className="text-xs text-muted mt-2">{today}</div>
          <button
            className="btn btn-primary mt-4 w-full"
            onClick={() => dispatch({ type: "passDay" })}
          >
            ⏎ compile &amp; ship day
          </button>
        </div>
        <div className="panel p-5">
          <div className="text-xs text-muted mb-1">level</div>
          <XPBar xp={state.xp} />
          <div className="mt-4 text-sm">
            🔥 <span className="text-matrix">{state.streak}</span> day streak
          </div>
        </div>
        <div className="panel p-5">
          <div className="text-xs text-muted mb-2">scripts</div>
          <ul className="space-y-1 text-sm">
            <li className="flex justify-between">
              <span>[OS] baseline</span>
              <span className="text-matrix">{baseline}</span>
            </li>
            <li className="flex justify-between">
              <span>[UPD] updates</span>
              <span className="text-cyan-300">{updates}</span>
            </li>
            <li className="flex justify-between">
              <span>[BUG] bugs</span>
              <span className="text-amber-bug">{bugs}</span>
            </li>
            <li className="flex justify-between">
              <span>[VIR] viruses</span>
              <span className="text-virus">{viruses}</span>
            </li>
          </ul>
        </div>
      </div>

      {wakeUps.length > 0 && (
        <div className="panel p-5">
          <div className="flex justify-between items-baseline mb-3">
            <div className="text-xs text-muted uppercase tracking-widest">
              // wake-up statements
            </div>
            <Link
              href="/profile"
              className="text-xs text-matrix hover:crt-text"
            >
              edit →
            </Link>
          </div>
          <ul className="space-y-2">
            {wakeUps.map((w) => (
              <li key={w.id} className="text-sm text-ink/90">
                <span className="text-matrix mr-2">&gt;</span>
                {w.text}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/library" className="panel p-5 block hover:shadow-glow-sm">
          <div className="text-matrix font-bold">Library →</div>
          <div className="text-xs text-muted mt-1">
            Edit, create, delete .gss files.
          </div>
        </Link>
        <Link href="/day" className="panel p-5 block hover:shadow-glow-sm">
          <div className="text-matrix font-bold">Day Builder →</div>
          <div className="text-xs text-muted mt-1">
            Schedule today's executable.
          </div>
        </Link>
        <Link href="/tester" className="panel p-5 block hover:shadow-glow-sm">
          <div className="text-matrix font-bold">Script Tester →</div>
          <div className="text-xs text-muted mt-1">
            Run a script in a Pomodoro window.
          </div>
        </Link>
      </div>

      {state.achievements.length > 0 && (
        <div className="panel p-5">
          <div className="text-xs text-muted uppercase tracking-widest mb-3">
            // achievements
          </div>
          <div className="flex flex-wrap gap-2">
            {state.achievements.map((a) => (
              <div
                key={a.id}
                className="tag !text-matrix !border-matrix/60"
                title={a.description}
              >
                ★ {a.title}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
