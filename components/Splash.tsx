"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MatrixRain from "./MatrixRain";
import { useScriptLab } from "@/lib/ScriptLabProvider";

const BOOT_LINES = [
  "> boot: scriptlabos.v0.1",
  "> loading kernel .............. [ok]",
  "> mounting /dev/self .......... [ok]",
  "> spawning developer process .. [ok]",
  "> ready.",
];

export default function Splash() {
  const router = useRouter();
  const { state, hydrated } = useScriptLab();
  const [shown, setShown] = useState(0);
  const [done, setDone] = useState(false);
  const [echo, setEcho] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    const wakeUps = state.profile?.wakeUps ?? [];
    if (wakeUps.length === 0) return;
    const pick = wakeUps[Math.floor(Math.random() * wakeUps.length)];
    setEcho(pick.text);
  }, [hydrated, state.profile]);

  useEffect(() => {
    const i = setInterval(() => {
      setShown((n) => {
        if (n >= BOOT_LINES.length) {
          clearInterval(i);
          setDone(true);
          return n;
        }
        return n + 1;
      });
    }, 380);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    if (!done || !hydrated) return;
    const advance = () => router.push(state.profile ? "/dashboard" : "/onboard");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [done, hydrated, state.profile, router]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg">
      <MatrixRain opacity={0.55} />
      <div className="absolute inset-0 bg-gradient-to-b from-bg/30 via-bg/60 to-bg" />
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full text-center px-6">
        <div className="crt-text mb-8 animate-flicker">
          <div className="text-matrix text-5xl md:text-7xl font-bold tracking-tight">
            &lt;/&gt; ScriptLabOS
          </div>
          <div className="text-matrix-dim tracking-[0.4em] text-xs md:text-sm mt-3">
            B Y &nbsp; G O A C T O
          </div>
        </div>
        <div className="text-ink/90 max-w-lg mb-10 text-sm md:text-base leading-relaxed space-y-3">
          <p>Our lives are the result of the scripts we allow ourselves to run.</p>
          <p className="text-matrix font-semibold">We are the developers of our life.</p>
          <p className="text-ink/70 text-sm">Boot the OS.</p>
        </div>
        <div className="panel px-6 py-4 text-left font-mono text-sm text-matrix w-full max-w-md">
          {BOOT_LINES.slice(0, shown).map((l) => (
            <div key={l} className="crt-text">
              {l}
            </div>
          ))}
          {shown < BOOT_LINES.length && (
            <span className="text-matrix animate-blink">_</span>
          )}
        </div>
        {done && echo && (
          <div className="mt-8 w-full max-w-md text-left">
            <div className="text-[10px] text-matrix-dim uppercase tracking-[0.35em] mb-2">
              // why you booted
            </div>
            <div className="text-ink/90 text-sm md:text-base italic crt-text">
              &ldquo;{echo}&rdquo;
            </div>
          </div>
        )}
        {done && (
          <div className="mt-8 flex flex-col items-center gap-2">
            <button
              autoFocus
              className="btn btn-primary"
              onClick={() =>
                router.push(state.profile ? "/dashboard" : "/onboard")
              }
            >
              [ enter ]
            </button>
            <div className="text-[10px] text-muted tracking-[0.3em]">
              press enter or space
            </div>
            <div className="mt-8 text-center">
              <div className="text-xs text-ink/60 leading-relaxed">
                We are
              </div>
              <div className="text-sm text-matrix-dim font-semibold tracking-wide">
                Growing Ourselves And Contributing To Others
              </div>
              <a
                href="https://GOACTO.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-matrix hover:text-matrix-dim transition-colors mt-1 inline-block"
              >
                Learn more at GOACTO.com
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
