"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useScriptLab } from "@/lib/ScriptLabProvider";
import { EXAMPLE_WAKE_UPS, TEMPLATES, templateToGss } from "@/lib/templates";
import { uid } from "@/lib/gss";
import MatrixRain from "./MatrixRain";
import type { Profile, WakeUpStatement } from "@/lib/types";

const STEPS = [
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
    if (step === 0) return name.trim().length >= 1;
    if (step === 1) return wakeUps.some((w) => w.text.trim().length > 0);
    if (step === 2) return values.some((v) => v.trim());
    if (step === 3) return goals.some((g) => g.trim());
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
          Installing ScriptLab OS
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

          {step === 1 && (
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

          {step === 2 && (
            <div className="space-y-3">
              <p className="text-sm text-muted">
                List up to 5 core values. These tag your scripts.
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

          {step === 3 && (
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

          {step === 4 && (
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
                      className={`text-left panel p-3 border ${
                        on
                          ? "border-matrix shadow-glow-sm"
                          : "border-matrix/20"
                      }`}
                    >
                      <div className="flex justify-between items-baseline">
                        <span className="text-matrix font-bold">
                          {t.title}
                        </span>
                        <span className="text-xs text-muted">
                          {t.durationMin}m · {t.type}
                        </span>
                      </div>
                      <div className="text-xs text-ink/70 mt-1">
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
              ⏎ boot scriptlab
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
