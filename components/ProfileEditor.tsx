"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useScriptLab } from "@/lib/ScriptLabProvider";
import { uid } from "@/lib/gss";
import type { Profile, WakeUpStatement } from "@/lib/types";

export default function ProfileEditor() {
  const router = useRouter();
  const { state, dispatch } = useScriptLab();
  const existing = state.profile!;

  const [name, setName] = useState(existing.name);
  const [wakeUps, setWakeUps] = useState<WakeUpStatement[]>(existing.wakeUps);
  const [values, setValues] = useState<string[]>(
    existing.values.length ? existing.values : [""]
  );
  const [goals, setGoals] = useState<string[]>(
    existing.goals.length ? existing.goals : [""]
  );

  const save = () => {
    const next: Profile = {
      ...existing,
      name: name.trim() || existing.name,
      wakeUps: wakeUps.filter((w) => w.text.trim()),
      values: values.map((v) => v.trim()).filter(Boolean),
      goals: goals.map((g) => g.trim()).filter(Boolean),
    };
    dispatch({ type: "setProfile", profile: next });
    router.push("/dashboard");
  };

  const cancel = () => router.push("/dashboard");

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl text-matrix crt-text font-bold">
            /profile — edit your OS
          </h1>
          <div className="text-xs text-muted">
            updates apply immediately to recommendations and the splash echo
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={cancel}>
            cancel
          </button>
          <button className="btn btn-primary" onClick={save}>
            save
          </button>
        </div>
      </div>

      <div className="panel p-6 mb-4">
        <label className="text-xs text-muted">developer name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="panel p-6 mb-4">
        <div className="flex justify-between items-baseline mb-3">
          <div>
            <div className="text-matrix font-bold">Wake-Up Statements</div>
            <div className="text-xs text-muted">
              &ldquo;I wake up to X so that Y so that Z&rdquo;
            </div>
          </div>
          <button
            className="btn !py-1 text-xs"
            onClick={() =>
              setWakeUps((l) => [...l, { id: uid(), text: "" }])
            }
          >
            + add
          </button>
        </div>
        {wakeUps.length === 0 && (
          <div className="text-xs text-muted italic">
            no wake-ups yet — add one.
          </div>
        )}
        <div className="space-y-2">
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
        </div>
      </div>

      <div className="panel p-6 mb-4">
        <div className="flex justify-between items-baseline mb-3">
          <div className="text-matrix font-bold">Core Values</div>
          <button
            className="btn !py-1 text-xs"
            onClick={() => setValues((l) => [...l, ""])}
          >
            + add
          </button>
        </div>
        <div className="grid gap-2">
          {values.map((v, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                value={v}
                placeholder={`value ${i + 1}`}
                onChange={(e) =>
                  setValues((arr) =>
                    arr.map((x, j) => (j === i ? e.target.value : x))
                  )
                }
              />
              <button
                className="btn btn-danger !py-1 !px-2 text-xs"
                onClick={() =>
                  setValues((arr) => arr.filter((_, j) => j !== i))
                }
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="panel p-6 mb-4">
        <div className="flex justify-between items-baseline mb-3">
          <div className="text-matrix font-bold">Goals</div>
          <button
            className="btn !py-1 text-xs"
            onClick={() => setGoals((l) => [...l, ""])}
          >
            + add
          </button>
        </div>
        <div className="grid gap-2">
          {goals.map((g, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                value={g}
                placeholder={`goal ${i + 1}`}
                onChange={(e) =>
                  setGoals((arr) =>
                    arr.map((x, j) => (j === i ? e.target.value : x))
                  )
                }
              />
              <button
                className="btn btn-danger !py-1 !px-2 text-xs"
                onClick={() =>
                  setGoals((arr) => arr.filter((_, j) => j !== i))
                }
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
