"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useScriptLab } from "@/lib/ScriptLabProvider";
import { exportState, resetState } from "@/lib/storage";
import MarkdownViewer from "@/components/MarkdownViewer";
import TutorialViewer from "@/components/TutorialViewer";

type DocType = "changelog" | "backlog" | "engineering" | null;

export default function SettingsPage() {
  const { state, dispatch, hydrated } = useScriptLab();
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<DocType>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!state.profile) router.push("/onboard");
  }, [hydrated, state.profile, router]);

  useEffect(() => {
    // Load dark mode preference from localStorage
    const savedMode = localStorage.getItem("theme");
    if (savedMode === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return newMode;
    });
  };

  const onExport = () => {
    const data = exportState(state);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scriptlabos-${state.profile?.name ?? "dev"}-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onImport = async (file: File) => {
    const text = await file.text();
    try {
      const parsed = JSON.parse(text);
      dispatch({ type: "importAll", state: parsed });
      alert("Import successful!");
    } catch {
      alert("Invalid file.");
    }
  };

  const onReset = () => {
    if (
      confirm(
        "Reset ScriptLabOS? This will wipe your profile, scripts, and progress from this browser."
      )
    ) {
      resetState();
      dispatch({ type: "reset" });
      router.push("/");
    }
  };

  if (!hydrated || !state.profile) return null;

  const completedRuns = state.scripts.reduce(
    (total, script) => total + script.runs.filter((r) => r.completed).length,
    0
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <button
        onClick={() => router.push("/dashboard")}
        className="text-sm text-muted hover:text-matrix transition-colors mb-4 flex items-center gap-1"
      >
        ← Back to Dashboard
      </button>
      <h1 className="text-2xl text-matrix crt-text font-bold mb-1">
        /settings — OS configuration
      </h1>
      <div className="text-xs text-muted mb-6">
        System preferences and data management
      </div>

      <div className="space-y-4">
        {/* Appearance */}
        <div className="panel p-6">
          <h2 className="text-lg text-matrix font-bold mb-1">Appearance</h2>
          <p className="text-xs text-muted mb-4">
            Customize the visual theme of your OS
          </p>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-ink/90">Dark Mode</div>
              <div className="text-xs text-muted">
                Toggle between light and dark themes
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                darkMode ? "bg-matrix" : "bg-matrix/30"
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 rounded-full bg-bg transition-transform ${
                  darkMode ? "translate-x-8" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Data Management */}
        <div className="panel p-6">
          <h2 className="text-lg text-matrix font-bold mb-1">Data Management</h2>
          <p className="text-xs text-muted mb-4">
            Export, import, or reset your ScriptLabOS data
          </p>

          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-matrix/10 pb-3">
              <div>
                <div className="text-sm text-ink/90">Export Data</div>
                <div className="text-xs text-muted">
                  Download all your scripts, profile, and progress as JSON
                </div>
              </div>
              <button className="btn !py-2 !px-4" onClick={onExport}>
                ⬇ Export
              </button>
            </div>

            <div className="flex items-center justify-between border-b border-matrix/10 pb-3">
              <div>
                <div className="text-sm text-ink/90">Import Data</div>
                <div className="text-xs text-muted">
                  Restore from a previously exported JSON file
                </div>
              </div>
              <label className="btn !py-2 !px-4 cursor-pointer">
                ⬆ Import
                <input
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onImport(f);
                  }}
                />
              </label>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <div className="text-sm text-virus">Reset OS</div>
                <div className="text-xs text-muted">
                  Permanently delete all data and start fresh
                </div>
              </div>
              <button
                className="btn btn-danger !py-2 !px-4"
                onClick={onReset}
              >
                🗑 Reset
              </button>
            </div>
          </div>
        </div>

        {/* Tutorials */}
        <div className="panel p-6">
          <h2 className="text-lg text-matrix font-bold mb-1">Learn ScriptLabOS</h2>
          <p className="text-xs text-muted mb-4">
            Step-by-step guides on how to use the platform
          </p>

          <button
            onClick={() => setShowTutorial(true)}
            className="btn btn-primary w-full !py-4 flex flex-col items-center"
          >
            <div className="text-lg font-bold">📘 View Interactive Tutorials</div>
            <div className="text-xs opacity-80 mt-1">
              8 guides covering all features
            </div>
          </button>
        </div>

        {/* Documentation */}
        <div className="panel p-6">
          <h2 className="text-lg text-matrix font-bold mb-1">Developer Documentation</h2>
          <p className="text-xs text-muted mb-4">
            For developers: project docs, changelog, and technical guides
          </p>

          <div className="grid md:grid-cols-3 gap-3">
            <button
              onClick={() => setViewingDoc("changelog")}
              className="btn !py-3 !px-4 flex-col items-start"
            >
              <div className="text-sm font-bold text-matrix">📝 Changelog</div>
              <div className="text-xs text-muted text-left">
                Version history and updates
              </div>
            </button>

            <button
              onClick={() => setViewingDoc("backlog")}
              className="btn !py-3 !px-4 flex-col items-start"
            >
              <div className="text-sm font-bold text-matrix">📋 Backlog</div>
              <div className="text-xs text-muted text-left">
                Upcoming features and tasks
              </div>
            </button>

            <button
              onClick={() => setViewingDoc("engineering")}
              className="btn !py-3 !px-4 flex-col items-start"
            >
              <div className="text-sm font-bold text-matrix">📚 Engineering Guide</div>
              <div className="text-xs text-muted text-left">
                Architecture and codebase walkthrough
              </div>
            </button>
          </div>
        </div>

        {/* About */}
        <div className="panel p-6">
          <h2 className="text-lg text-matrix font-bold mb-1">About</h2>
          <div className="space-y-2 text-sm text-ink/80">
            <div className="flex justify-between">
              <span className="text-muted">Version</span>
              <span>v0.1.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Profile</span>
              <span>{state.profile.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Scripts</span>
              <span>{state.scripts.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Completed Runs</span>
              <span>✓ {completedRuns}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">XP</span>
              <span>{state.xp}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Streak</span>
              <span>🔥 {state.streak} days</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-matrix/10 text-center">
            <a
              href="https://GOACTO.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-matrix-dim hover:text-matrix transition-colors"
            >
              Growing Ourselves And Contributing To Others
            </a>
          </div>
        </div>
      </div>

      {viewingDoc === "changelog" && (
        <MarkdownViewer
          filePath="/CHANGELOG.md"
          title="ScriptLabOS Changelog"
          subtitle="Version history and updates for this application"
          onClose={() => setViewingDoc(null)}
        />
      )}

      {viewingDoc === "backlog" && (
        <MarkdownViewer
          filePath="/BACKLOG.md"
          title="ScriptLabOS Backlog"
          subtitle="Upcoming features and planned improvements"
          onClose={() => setViewingDoc(null)}
        />
      )}

      {viewingDoc === "engineering" && (
        <MarkdownViewer
          filePath="/ENGINEERING_GUIDE.md"
          title="ScriptLabOS Engineering Guide"
          subtitle="Learn how to build this application - from beginner to advanced"
          onClose={() => setViewingDoc(null)}
        />
      )}

      {showTutorial && <TutorialViewer onClose={() => setShowTutorial(false)} />}
    </div>
  );
}
