"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getModule, isAvailable, loadAnswers, saveAnswer, type BookAnswers } from "@/lib/bookModules";

export default function BookModulePage() {
  const { id } = useParams<{ id: string }>();
  const m = getModule(id);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<BookAnswers>({});
  useEffect(() => setAnswers(loadAnswers(window.localStorage)), []);

  if (!m || !isAvailable(m)) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 text-sm text-muted">
        This module is coming soon. <Link href="/book" className="text-matrix underline">Back to all chapters</Link>
      </div>
    );
  }
  const done = step >= m.steps.length;
  const s = m.steps[step];
  const mine = answers[m.id] ?? {};

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link href="/book" className="text-xs text-muted">← All chapters</Link>
      <div className="text-xs text-muted mt-2">Chapter {m.chapter}{m.sample ? " · SAMPLE" : ""}</div>
      <h1 className="text-xl text-matrix crt-text font-bold mb-2">{m.title}</h1>
      {step === 0 && <p className="text-sm text-ink/80 mb-4" data-testid="book-intro">{m.intro}</p>}
      {!done ? (
        <div className="panel p-4">
          <div className="text-xs text-muted mb-1">Step {step + 1} of {m.steps.length}</div>
          <h2 className="text-ink/90 font-bold mb-3">{s.title}</h2>
          {s.prompts.map((p) => (
            <label key={p.key} className="block mb-3">
              <span className="block text-sm text-ink/90 mb-1">{p.label}</span>
              <textarea
                rows={3}
                value={mine[p.key] ?? ""}
                onChange={(e) => setAnswers(saveAnswer(window.localStorage, m.id, p.key, e.target.value))}
              />
            </label>
          ))}
          <div className="flex justify-between">
            <button className="btn" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</button>
            <button className="btn btn-primary" onClick={() => setStep(step + 1)}>Next</button>
          </div>
        </div>
      ) : (
        <div className="panel p-4" data-testid="book-stop">
          <p className="text-sm text-ink/90 mb-3">{m.stop}</p>
          <p className="text-xs text-muted mb-3">Saved on this device.</p>
          <button className="btn" onClick={() => setStep(0)}>Back to edit</button>
        </div>
      )}
    </div>
  );
}
