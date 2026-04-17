"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useScriptLab } from "@/lib/ScriptLabProvider";
import { levelFor } from "@/lib/gamification";
import { exportState, resetState } from "@/lib/storage";

const NAV = [
  { href: "/dashboard", label: "HUD" },
  { href: "/library", label: "Library" },
  { href: "/packages", label: "Packages" },
  { href: "/day", label: "Day Builder" },
  { href: "/tester", label: "Tester" },
  { href: "/profile", label: "Profile" },
];

export default function NavBar() {
  const { state, dispatch } = useScriptLab();
  const pathname = usePathname();
  const router = useRouter();
  const { current } = levelFor(state.xp);

  if (!state.profile) return null;

  const onExport = () => {
    const data = exportState(state);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scriptlab-${state.profile?.name ?? "dev"}-${new Date()
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
    } catch {
      alert("Invalid file.");
    }
  };

  const onReset = () => {
    if (
      confirm(
        "Reset ScriptLab? This will wipe your profile, scripts, and progress from this browser."
      )
    ) {
      resetState();
      dispatch({ type: "reset" });
      router.push("/");
    }
  };

  return (
    <header className="sticky top-0 z-20 panel border-0 border-b !rounded-none backdrop-blur">
      <div className="max-w-6xl mx-auto flex items-center gap-6 px-4 py-3 text-sm">
        <Link href="/dashboard" className="text-matrix crt-text font-bold">
          &lt;/&gt; ScriptLab
        </Link>
        <nav className="flex gap-1">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`px-3 py-1 rounded ${
                pathname === n.href
                  ? "bg-matrix/15 text-matrix crt-text"
                  : "text-ink/70 hover:text-matrix"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-muted hidden md:inline">
            ⌘K
          </span>
          <span className="text-xs text-muted">
            <span className="text-matrix">{current.name}</span> · {state.xp} XP
            · 🔥 {state.streak}
          </span>
          <button className="btn !py-1 !px-2 text-xs" onClick={onExport}>
            export
          </button>
          <label className="btn !py-1 !px-2 text-xs cursor-pointer">
            import
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
          <button
            className="btn btn-danger !py-1 !px-2 text-xs"
            onClick={onReset}
          >
            reset
          </button>
        </div>
      </div>
    </header>
  );
}
