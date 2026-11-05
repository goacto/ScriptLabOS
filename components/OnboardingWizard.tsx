"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useScriptLab } from "@/lib/ScriptLabProvider";
import { uid } from "@/lib/gss";
import { todayStr } from "@/lib/dates";
import {
  EXAMPLE_WAKE_UPS,
  GOACTO_LINE,
  SKIP_SETUP_LABEL,
  SKIP_VALUES_LABEL,
  STEP_ONE_LEAD,
  VALUE_CHIPS,
  VALUE_PICK_LIMIT,
  blankSkippedProfile,
  buildSampleExecutable,
  buildSeedScripts,
  toggleChip,
} from "@/lib/onboarding";
import MatrixRain from "./MatrixRain";
import type { Profile } from "@/lib/types";

const STEPS = [
  "Welcome to ScriptLabOS",
  "Developer Profile",
  "Wake-Up Statement",
  "Core Values",
  "Goals",
] as const;

const CODE_LOOK = [
  { tag: "[OS]", tone: "text-matrix-dim", label: "Baseline — heartbeat habits (sleep, breathe, move)" },
  { tag: "[UPD]", tone: "text-matrix-dim", label: "Update — learning and skill practice" },
  { tag: "[UP+]", tone: "text-matrix-dim", label: "Upgrade — identity-level shifts" },
  { tag: "[BUG]", tone: "text-amber-bug", label: "Bug — old habits you notice and log" },
  { tag: "[VIR]", tone: "text-virus", label: "Virus — old beliefs to branch past" },
] as const;

export default function OnboardingWizard() {
  const router = useRouter();
  const { dispatch } = useScriptLab();
  const [step, setStep] = useState(0);

  const [name, setName] = useState("");
  const [wakeUpId] = useState(() => uid());
  const [wakeUpText, setWakeUpText] = useState("");
  const [values, setValues] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>(["", "", ""]);

  const canNext = useMemo(() => {
    if (step === 1) return name.trim().length >= 1;
    if (step === 3) return values.length >= VALUE_PICK_LIMIT;
    if (step === 4) return goals.some((goal) => goal.trim());
    return true;
  }, [step, name, values, goals]);

  const finish = () => {
    const profile: Profile = {
      name: name.trim(),
      wakeUps: wakeUpText.trim()
        ? [{ id: wakeUpId, text: wakeUpText.trim() }]
        : [],
      values,
      goals: goals.map((goal) => goal.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: "setProfile", profile });
    router.push("/dashboard");
  };

  const skipToSampleDay = () => {
    const scripts = buildSeedScripts();
    dispatch({
      type: "startSampleDay",
      profile: blankSkippedProfile(new Date().toISOString()),
      scripts,
      executable: buildSampleExecutable(scripts, todayStr()),
    });
    router.push("/dashboard");
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="relative min-h-screen w-full">
      <MatrixRain opacity={0.25} />
      <div className="absolute inset-0 bg-bg/80" />
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
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

        <div className="panel p-5 sm:p-6">
          {step === 0 && (
            <div className="space-y-5">
              <p className="text-base text-ink/90 leading-relaxed">{STEP_ONE_LEAD}</p>
              <ul className="font-mono text-sm text-muted space-y-1 border-l-2 border-matrix/30 pl-4">
                {CODE_LOOK.map((row) => (
                  <li key={row.tag}>
                    <span className={row.tone}>{row.tag}</span> {row.label}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="btn btn-primary w-full min-h-11 justify-center text-center"
                onClick={skipToSampleDay}
              >
                {SKIP_SETUP_LABEL}
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <label className="block text-sm text-muted" htmlFor="dev-name">
                What should we call you?
              </label>
              <input
                id="dev-name"
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
                Optional. One line is enough. Tap an example, or write your own.
              </p>
              <label className="sr-only" htmlFor="wake-up">
                Wake-up statement
              </label>
              <textarea
                id="wake-up"
                rows={3}
                placeholder="I wake up to …"
                value={wakeUpText}
                onChange={(e) => setWakeUpText(e.target.value)}
              />
              <div className="grid gap-2">
                {EXAMPLE_WAKE_UPS.map((example) => {
                  const on = wakeUpText === example;
                  return (
                    <button
                      key={example}
                      type="button"
                      aria-pressed={on}
                      onClick={() =>
                        setWakeUpText((current) =>
                          current === example ? "" : example
                        )
                      }
                      className={`text-left min-h-11 px-3 py-2 rounded border text-sm leading-snug ${
                        on
                          ? "border-matrix bg-matrix/10 text-ink"
                          : "border-matrix/30 text-ink/80 hover:border-matrix/60"
                      }`}
                    >
                      {example}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-muted">
                Pick {VALUE_PICK_LIMIT}. These tag the scripts you write later.
              </p>
              <div className="text-xs text-matrix-dim">
                {values.length} of {VALUE_PICK_LIMIT}
              </div>
              <div className="flex flex-wrap gap-2">
                {VALUE_CHIPS.map((chip) => {
                  const on = values.includes(chip);
                  return (
                    <button
                      key={chip}
                      type="button"
                      aria-pressed={on}
                      onClick={() =>
                        setValues((selected) => toggleChip(selected, chip))
                      }
                      className={`min-h-11 px-3 py-2 rounded-full border text-sm ${
                        on
                          ? "border-matrix bg-matrix/15 text-matrix"
                          : "border-matrix/30 text-ink/80 hover:border-matrix/60"
                      }`}
                    >
                      {chip}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                className="btn min-h-11"
                onClick={() => setStep(4)}
              >
                {SKIP_VALUES_LABEL}
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <p className="text-sm text-muted">
                List up to 3 goals you want this to serve. Add the habits
                themselves later in Settings → Set up my scripts.
              </p>
              {goals.map((goal, index) => (
                <input
                  key={index}
                  placeholder={`goal ${index + 1}`}
                  value={goal}
                  onChange={(e) =>
                    setGoals((list) =>
                      list.map((item, j) => (j === index ? e.target.value : item))
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-between gap-3">
          <button
            type="button"
            className="btn min-h-11"
            onClick={() => setStep((current) => Math.max(0, current - 1))}
            disabled={step === 0}
          >
            ← back
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              className="btn btn-primary min-h-11"
              disabled={!canNext}
              onClick={() => setStep((current) => current + 1)}
            >
              next →
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary min-h-11"
              disabled={!canNext}
              onClick={finish}
            >
              Go to Home
            </button>
          )}
        </div>

        <footer className="mt-10 text-center">
          <div className="text-xs text-ink/60 leading-relaxed">We are</div>
          <div className="text-sm text-matrix-dim font-semibold tracking-wide">
            {GOACTO_LINE}
          </div>
        </footer>
      </div>
    </div>
  );
}
