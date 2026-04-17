"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useScriptLab } from "@/lib/ScriptLabProvider";
import { makeGss } from "@/lib/gss";
import { exportState, resetState } from "@/lib/storage";
import type { GssType } from "@/lib/types";

interface Cmd {
  id: string;
  label: string;
  hint?: string;
  run: () => void;
}

export default function CommandPalette() {
  const router = useRouter();
  const { state, dispatch } = useScriptLab();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        setQuery("");
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const newScript = (type: GssType) => {
    const script = makeGss({
      title: `new ${type}`,
      type,
      durationMin: type === "bug" || type === "virus" ? 0 : 25,
    });
    dispatch({ type: "addScript", script });
    router.push("/library");
  };

  const cmds: Cmd[] = useMemo(() => {
    const base: Cmd[] = [
      { id: "go-hud", label: "Go to HUD", hint: "/dashboard", run: () => router.push("/dashboard") },
      { id: "go-library", label: "Go to Library", hint: "/library", run: () => router.push("/library") },
      { id: "go-packages", label: "Go to Packages", hint: "/packages", run: () => router.push("/packages") },
      { id: "go-day", label: "Go to Day Builder", hint: "/day", run: () => router.push("/day") },
      { id: "go-tester", label: "Go to Script Tester", hint: "/tester", run: () => router.push("/tester") },
      { id: "go-profile", label: "Edit profile (wake-ups, values, goals)", hint: "/profile", run: () => router.push("/profile") },
      { id: "new-baseline", label: "New baseline .gss", hint: "[OS]", run: () => newScript("baseline") },
      { id: "new-update", label: "New update .gss", hint: "[UPD]", run: () => newScript("update") },
      { id: "new-upgrade", label: "New upgrade .gss", hint: "[UP+]", run: () => newScript("upgrade") },
      { id: "new-bug", label: "New bug to patch", hint: "[BUG]", run: () => newScript("bug") },
      { id: "new-virus", label: "New virus to overwrite", hint: "[VIR]", run: () => newScript("virus") },
      {
        id: "compile-day",
        label: "Compile & ship today",
        hint: "passDay",
        run: () => {
          dispatch({ type: "passDay" });
          router.push("/dashboard");
        },
      },
      {
        id: "export",
        label: "Export state as JSON",
        hint: "download",
        run: () => {
          const blob = new Blob([exportState(state)], {
            type: "application/json",
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `scriptlab-${new Date().toISOString().slice(0, 10)}.json`;
          a.click();
          URL.revokeObjectURL(url);
        },
      },
      {
        id: "reset",
        label: "Reset all data",
        hint: "danger",
        run: () => {
          if (confirm("Wipe profile, scripts, packages, and progress?")) {
            resetState();
            dispatch({ type: "reset" });
            router.push("/");
          }
        },
      },
    ];
    state.scripts.forEach((s) => {
      base.push({
        id: `run-${s.id}`,
        label: `Run "${s.title}"`,
        hint: `${s.durationMin}m · tester`,
        run: () => router.push(`/tester?id=${encodeURIComponent(s.id)}`),
      });
    });
    return base;
  }, [router, state, dispatch]);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? cmds.filter(
        (c) =>
          c.label.toLowerCase().includes(q) ||
          c.hint?.toLowerCase().includes(q)
      )
    : cmds;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-24 bg-bg/80 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="panel w-full max-w-xl shadow-glow border-matrix"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-matrix/20 p-3">
          <input
            autoFocus
            placeholder="type a command…  (esc to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && filtered[0]) {
                filtered[0].run();
                setOpen(false);
              }
            }}
            className="!border-0 !bg-transparent !p-0 text-matrix text-base"
          />
        </div>
        <ul className="max-h-[50vh] overflow-y-auto">
          {filtered.length === 0 && (
            <li className="px-4 py-3 text-muted text-sm italic">
              no commands match
            </li>
          )}
          {filtered.slice(0, 30).map((c, i) => (
            <li key={c.id}>
              <button
                onClick={() => {
                  c.run();
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm flex justify-between items-center hover:bg-matrix/10 ${
                  i === 0 ? "bg-matrix/5" : ""
                }`}
              >
                <span className="text-ink">{c.label}</span>
                {c.hint && (
                  <span className="text-xs text-muted">{c.hint}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
        <div className="border-t border-matrix/20 px-3 py-2 text-[10px] text-muted flex justify-between">
          <span>↵ run · esc close</span>
          <span>⌘K toggle</span>
        </div>
      </div>
    </div>
  );
}
