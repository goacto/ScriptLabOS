"use client";

import { useEffect, useState } from "react";
import { setUsageSharing, usageSharingOn } from "@/lib/goactoPing";

/** Settings panel: "Share anonymous usage count" (on by default; off = no pings). */
export default function UsageToggle() {
  const [on, setOn] = useState(true);
  useEffect(() => setOn(usageSharingOn({ storage: window.localStorage })), []);
  const flip = () => {
    setUsageSharing({ storage: window.localStorage }, !on);
    setOn(!on);
  };
  return (
    <div className="panel p-6">
      <h2 className="text-lg text-matrix font-bold mb-1">Privacy</h2>
      <p className="text-xs text-muted mb-4">One anonymous count per day. No account, page or IP is stored.</p>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-ink/90">Share anonymous usage count</div>
          <div className="text-xs text-muted">Helps GOACTO see how many people use ScriptLabOS each week</div>
        </div>
        <button
          onClick={flip}
          role="switch"
          aria-checked={on}
          aria-label="Share anonymous usage count"
          className={`relative w-14 h-7 rounded-full transition-colors ${on ? "bg-matrix" : "bg-matrix/30"}`}
        >
          <div className={`absolute top-1 w-5 h-5 rounded-full bg-bg transition-transform ${on ? "translate-x-8" : "translate-x-1"}`} />
        </button>
      </div>
    </div>
  );
}
