"use client";
import Link from "next/link";
import { BOOK_MODULES, isAvailable } from "@/lib/bookModules";

export default function BookIndex() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl text-matrix crt-text font-bold">/book — Chapter modules</h1>
      <p className="text-sm text-muted mt-1 mb-4">
        One short exercise per chapter. Free, always. Your answers stay on this device.
      </p>
      <ul className="space-y-2" data-testid="book-list">
        {BOOK_MODULES.map((m) => (
          <li key={m.id} className="panel p-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs text-muted">Chapter {m.chapter}</div>
              <div className="text-ink/90">{m.title}</div>
            </div>
            {isAvailable(m) ? (
              <Link href={`/book/${m.id}`} className="btn btn-primary text-sm whitespace-nowrap">
                Open{m.sample ? " (sample)" : ""}
              </Link>
            ) : (
              <span className="text-xs text-muted whitespace-nowrap">Coming soon</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
