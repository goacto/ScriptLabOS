"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useScriptLab } from "@/lib/ScriptLabProvider";
import { EXAMPLE_WAKE_UPS, TEMPLATES, templateToGss } from "@/lib/templates";
import { uid } from "@/lib/gss";
import MatrixRain from "./MatrixRain";
import type { Profile, WakeUpStatement } from "@/lib/types";

const STEPS = [
  "Welcome to ScriptLabOS",
  "Developer Profile",
  "Wake-Up Statements",
  "Core Values",
  "Goals",
  "Seed Templates",
] as const;

export default function OnboardingWizard() {
  const router = useRouter();
  const { dispatch } = useScriptLab();
  const [step, setStep] = useState(0);

  const [name, setName] = useState("");
  const [wakeUps, setWakeUps] = useState<WakeUpStatement[]>(
    EXAMPLE_WAKE_UPS.map((t) => ({ id: uid(), text: t }))
  );
  const [values, setValues] = useState<string[]>(["", "", "", "", ""]);
  const [goals, setGoals] = useState<string[]>(["", "", ""]);
  const [picked, setPicked] = useState<Set<string>>(
    new Set(["tpl-morning-breath", "tpl-deep-read", "tpl-evening-reflect"])
  );

  const canNext = useMemo(() => {
    if (step === 0) return true; // Platform overview, no validation
    if (step === 1) return name.trim().length >= 1;
    if (step === 2) return wakeUps.some((w) => w.text.trim().length > 0);
    if (step === 3) return values.filter((v) => v.trim()).length >= 3;
    if (step === 4) return goals.some((g) => g.trim());
    return true;
  }, [step, name, wakeUps, values, goals]);

  const finish = () => {
    const profile: Profile = {
      name: name.trim(),
      wakeUps: wakeUps.filter((w) => w.text.trim()),
      values: values.map((v) => v.trim()).filter(Boolean),
      goals: goals.map((g) => g.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: "setProfile", profile });
    TEMPLATES.filter((t) => picked.has(t.id)).forEach((t) => {
      dispatch({ type: "addScript", script: templateToGss(t) });
    });
    router.push("/dashboard");
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="relative min-h-screen w-full">
      <MatrixRain opacity={0.25} />
      <div className="absolute inset-0 bg-bg/80" />
      <div className="relative z-10 max-w-2xl mx-auto px-6 py-12">
        <div className="mb-2 text-xs text-matrix-dim uppercase tracking-[0.4em]">
          Installing ScriptLabOS
        </div>
        <h1 className="text-3xl text-matrix crt-text font-bold mb-1">
          {STEPS[step]}
        </h1>
        <div className="text-xs text-muted mb-6">
          step {step + 1} of {STEPS.length}
        </div>
        <div className="h-1 bg-bg-elev rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-matrix transition-all shadow-glow-sm"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="panel p-6">
          {step === 0 && (
            <div className="space-y-5">
              <p className="text-base text-ink/90 leading-relaxed">
                <span className="text-matrix font-bold">Your brain is a computer. Each minute of your day is a line of code.</span> ScriptLabOS helps you debug bad habits, upgrade your mindset, and compile better days.
              </p>

              <div className="space-y-4 pt-2">
                <div className="border-l-2 border-matrix/30 pl-4">
                  <h3 className="text-sm font-bold text-matrix mb-1">The Core Metaphor</h3>
                  <ul className="text-sm text-muted space-y-1">
                    <li><span className="text-matrix-dim">[OS]</span> Baseline — heartbeat habits (sleep, breathe, move)</li>
                    <li><span className="text-matrix-dim">[UPD]</span> Update — learning & skill practice</li>
                    <li><span className="text-matrix-dim">[UP+]</span> Upgrade — identity-level shifts</li>
                    <li><span className="text-accent-amber">[BUG]</span> Bug — bad habits to patch</li>
                    <li><span className="text-accent-red">[VIR]</span> Virus — limiting beliefs to delete</li>
                  </ul>
                </div>

                <div className="border-l-2 border-matrix/30 pl-4">
                  <h3 className="text-sm font-bold text-matrix mb-1">How It Works</h3>
                  <ul className="text-sm text-muted space-y-1">
                    <li>• <span className="text-ink/80">Library:</span> create and audit/edit .gss scripts (habits/practices)</li>
                    <li>• <span className="text-ink/80">Day Builder:</span> drag scripts onto a timeline to plan your day</li>
                    <li>• <span className="text-ink/80">Tester:</span> run scripts with a Pomodoro timer, earn XP</li>
                    <li>• <span className="text-ink/80">Level up:</span> from Junior Dev → Architect of Self</li>
                  </ul>
                </div>

                <div className="border-l-2 border-matrix/30 pl-4">
                  <h3 className="text-sm font-bold text-matrix mb-1">Your Profile Powers Everything</h3>
                  <p className="text-sm text-muted">
                    The next steps collect your <span className="text-matrix-dim">wake-up statements</span> (your "why"), <span className="text-matrix-dim">core values</span>, and <span className="text-matrix-dim">goals</span>. We use these to recommend scripts, tag your library, and keep you aligned with what matters.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <label className="block text-sm text-muted">
                What should we call you, developer?
              </label>
              <input
                autoFocus
                placeholder="e.g. Neo"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-muted">
                Add one or more statements in the form
                <span className="text-matrix">
                  {" "}
                  "I wake up to <em>X</em> so that <em>Y</em> so that{" "}
                  <em>Z</em>."
                </span>{" "}
                These drive which scripts we suggest.
              </p>
              {wakeUps.map((w, i) => (
                <div key={w.id} className="flex gap-2 items-start">
                  <span className="text-matrix-dim text-xs pt-3 w-6">
                    {i + 1}.
                  </span>
                  <textarea
                    rows={2}
                    value={w.text}
                    onChange={(e) =>
                      setWakeUps((list) =>
                        list.map((x) =>
                          x.id === w.id ? { ...x, text: e.target.value } : x
                        )
                      )
                    }
                  />
                  <button
                    className="btn btn-danger !py-1 !px-2 text-xs"
                    onClick={() =>
                      setWakeUps((l) => l.filter((x) => x.id !== w.id))
                    }
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                className="btn text-xs"
                onClick={() =>
                  setWakeUps((l) => [...l, { id: uid(), text: "" }])
                }
              >
                + add statement
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <p className="text-sm text-muted mb-2">
                Values are principles that guide your decisions and actions. They're non-negotiable parts of who you are or want to become.
              </p>
              <p className="text-xs text-matrix-dim mb-3">
                Examples: Growth, Courage, Integrity, Health, Creativity, Family, Freedom, Excellence
              </p>
              <p className="text-sm text-ink/80 mb-1">
                Enter at least 3 core values (max 5). These will tag your scripts.
              </p>
              {values.map((v, i) => (
                <input
                  key={i}
                  placeholder={`value ${i + 1}`}
                  value={v}
                  onChange={(e) =>
                    setValues((arr) =>
                      arr.map((x, j) => (j === i ? e.target.value : x))
                    )
                  }
                />
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <p className="text-sm text-muted">
                List up to 3 goals you want this OS to serve.
              </p>
              {goals.map((g, i) => (
                <input
                  key={i}
                  placeholder={`goal ${i + 1}`}
                  value={g}
                  onChange={(e) =>
                    setGoals((arr) =>
                      arr.map((x, j) => (j === i ? e.target.value : x))
                    )
                  }
                />
              ))}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-3">
              <p className="text-sm text-muted">
                Import starter .gss templates into your Library. You can
                always add more later.
              </p>
              <div className="grid gap-2">
                {TEMPLATES.map((t) => {
                  const on = picked.has(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() =>
                        setPicked((s) => {
                          const n = new Set(s);
                          if (on) n.delete(t.id);
                          else n.add(t.id);
                          return n;
                        })
                      }
                      className={`text-left panel p-3 border transition-all ${
                        on
                          ? "border-matrix shadow-glow-sm bg-matrix/10"
                          : "border-matrix/20 hover:border-matrix/40"
                      }`}
                    >
                      <div className="flex justify-between items-baseline">
                        <div className="flex items-center gap-2">
                          <span className={`text-lg ${on ? "text-matrix" : "text-matrix/30"}`}>
                            {on ? "☑" : "☐"}
                          </span>
                          <span className={`font-bold ${on ? "text-matrix" : "text-ink/80"}`}>
                            {t.title}
                          </span>
                        </div>
                        <span className="text-xs text-muted">
                          {t.durationMin}m · {t.type}
                        </span>
                      </div>
                      <div className={`text-xs mt-1 ml-7 ${on ? "text-ink/90" : "text-ink/60"}`}>
                        {t.intent}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-between">
          <button
            className="btn"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            ← back
          </button>
          {step < STEPS.length - 1 ? (
            <button
              className="btn btn-primary"
              disabled={!canNext}
              onClick={() => setStep((s) => s + 1)}
            >
              next →
            </button>
          ) : (
            <button className="btn btn-primary" onClick={finish}>
              ⏎ boot ScriptLabOS
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
