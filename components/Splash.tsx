"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MatrixRain from "./MatrixRain";
import { useScriptLab } from "@/lib/ScriptLabProvider";

const BOOT_LINES = [
  "> boot: scriptlab.os.v0.1",
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
    const t = setTimeout(() => {
      router.push(state.profile ? "/dashboard" : "/onboard");
    }, 600);
    return () => clearTimeout(t);
  }, [done, hydrated, state.profile, router]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg">
      <MatrixRain opacity={0.55} />
      <div className="absolute inset-0 bg-gradient-to-b from-bg/30 via-bg/60 to-bg" />
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full text-center px-6">
        <div className="crt-text mb-8 animate-flicker">
          <div className="text-matrix text-5xl md:text-7xl font-bold tracking-tight">
            &lt;/&gt; ScriptLab
          </div>
          <div className="text-matrix-dim tracking-[0.4em] text-xs md:text-sm mt-3">
            B Y &nbsp; G O A C T O
          </div>
        </div>
        <p className="text-ink/80 max-w-lg mb-10 text-sm md:text-base">
          You are the developer of your own life. Boot the OS.
        </p>
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
        {done && (
          <button
            className="btn btn-primary mt-8"
            onClick={() =>
              router.push(state.profile ? "/dashboard" : "/onboard")
            }
          >
            [ enter ]
          </button>
        )}
      </div>
    </div>
  );
}
