"use client";

import { typeIcon, typeLabel } from "@/lib/gss";
import type { GssFile, GssType } from "@/lib/types";

const ORDER: GssType[] = ["baseline", "update", "upgrade", "bug", "virus"];

export default function FileTree({
  scripts,
  selectedId,
  onSelect,
  onNew,
}: {
  scripts: GssFile[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNew: (type: GssType) => void;
}) {
  const grouped: Record<GssType, GssFile[]> = {
    baseline: [],
    update: [],
    upgrade: [],
    bug: [],
    virus: [],
    package: [],
  };
  scripts.forEach((s) => grouped[s.type].push(s));

  return (
    <div className="panel p-3 h-full overflow-y-auto text-sm">
      <div className="text-xs text-muted uppercase tracking-widest mb-2 px-1">
        /dev/self
      </div>
      {ORDER.map((type) => (
        <div key={type} className="mb-3">
          <div className="flex items-center justify-between px-1 text-matrix-dim">
            <span>
              📁 {typeLabel[type].toLowerCase().replace(/\s/g, "-")}/
            </span>
            <button
              title={`new ${typeLabel[type]}`}
              onClick={() => onNew(type)}
              className="text-xs text-matrix hover:crt-text"
            >
              +
            </button>
          </div>
          <ul className="mt-1">
            {grouped[type].length === 0 && (
              <li className="text-xs text-muted/60 pl-5 italic">empty</li>
            )}
            {grouped[type].map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => onSelect(s.id)}
                  className={`w-full text-left pl-5 pr-2 py-1 rounded truncate ${
                    selectedId === s.id
                      ? "bg-matrix/15 text-matrix crt-text"
                      : "hover:bg-matrix/5 text-ink/80"
                  }`}
                >
                  <span className="text-[10px] text-muted mr-1">
                    {typeIcon[s.type]}
                  </span>
                  {s.name}.gss
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
