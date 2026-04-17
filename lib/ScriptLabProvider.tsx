"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
} from "react";
import type { ScriptLabState } from "./types";
import { emptyState, loadState, saveState } from "./storage";
import { reducer, type Action } from "./reducer";

interface Ctx {
  state: ScriptLabState;
  dispatch: React.Dispatch<Action>;
  hydrated: boolean;
}

const ScriptLabContext = createContext<Ctx | null>(null);

export function ScriptLabProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, emptyState);
  const [hydrated, setHydrated] = React.useState(false);

  useEffect(() => {
    const loaded = loadState();
    dispatch({ type: "hydrate", state: loaded });
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  return (
    <ScriptLabContext.Provider value={{ state, dispatch, hydrated }}>
      {children}
    </ScriptLabContext.Provider>
  );
}

export function useScriptLab() {
  const ctx = useContext(ScriptLabContext);
  if (!ctx) throw new Error("useScriptLab must be used within ScriptLabProvider");
  return ctx;
}
