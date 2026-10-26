"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { playEndChime } from "@/lib/chime";
import {
  idleSession,
  parseSession,
  pauseSession,
  secondsLeft,
  serializeSession,
  settleSession,
  startSession,
  type SessionTimer,
} from "@/lib/timer";

const TIMER_KEY = "scriptlab:timer:v1";

interface TimerApi {
  ready: boolean;
  now: number;
  session: SessionTimer | null;
  begin: (scriptId: string, durationSec: number) => void;
  pause: () => void;
  reset: (scriptId: string, durationSec: number) => void;
}

const TimerContext = createContext<TimerApi | null>(null);

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(0);
  const [session, setSession] = useState<SessionTimer | null>(null);
  const liveRun = useRef<number | null>(null);

  useEffect(() => {
    setSession(parseSession(window.localStorage.getItem(TIMER_KEY)));
    setNow(Date.now());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!session) {
      window.localStorage.removeItem(TIMER_KEY);
      return;
    }
    window.localStorage.setItem(TIMER_KEY, serializeSession(session));
  }, [session, ready]);

  useEffect(() => {
    if (session?.status !== "running") return;
    const tick = () => setNow(Date.now());
    const id = window.setInterval(tick, 1000);
    const onVis = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [session?.status]);

  useEffect(() => {
    if (!session || now === 0) return;
    const settled = settleSession(session, now);
    if (settled !== session) setSession(settled);
  }, [session, now]);

  useEffect(() => {
    if (!session) return;
    if (
      session.status === "running" &&
      session.startedAt != null &&
      secondsLeft(session, Date.now()) > 0
    ) {
      liveRun.current = session.startedAt;
    }
    if (
      session.status === "complete" &&
      session.startedAt != null &&
      liveRun.current === session.startedAt
    ) {
      liveRun.current = null;
      void playEndChime();
    }
  }, [session]);

  const begin = (scriptId: string, durationSec: number) => {
    const at = Date.now();
    setNow(at);
    setSession((prev) => {
      const base =
        prev && prev.scriptId === scriptId && prev.status !== "complete"
          ? prev
          : idleSession(scriptId, durationSec);
      return startSession(base, at);
    });
  };

  const pause = () => {
    const at = Date.now();
    setNow(at);
    setSession((prev) => (prev ? pauseSession(prev, at) : prev));
  };

  const reset = (scriptId: string, durationSec: number) => {
    setNow(Date.now());
    setSession(idleSession(scriptId, durationSec));
  };

  return (
    <TimerContext.Provider value={{ ready, now, session, begin, pause, reset }}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error("useTimer must be used within TimerProvider");
  return ctx;
}
