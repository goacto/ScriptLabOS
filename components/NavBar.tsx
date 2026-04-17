"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useScriptLab } from "@/lib/ScriptLabProvider";
import { levelFor } from "@/lib/gamification";

const NAV = [
  { href: "/dashboard", label: "HUD" },
  { href: "/library", label: "Library" },
  { href: "/packages", label: "Packages" },
  { href: "/day", label: "Day Builder" },
  { href: "/tester", label: "Tester" },
  { href: "/analytics", label: "Analytics" },
  { href: "/history", label: "History" },
  { href: "/profile", label: "Profile" },
  { href: "/settings", label: "Settings" },
];

export default function NavBar() {
  const { state } = useScriptLab();
  const pathname = usePathname();
  const { current } = levelFor(state.xp);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!state.profile) return null;

  return (
    <>
      <header className="sticky top-0 z-30 panel border-0 border-b !rounded-none backdrop-blur overflow-x-hidden">
        <div className="max-w-6xl mx-auto flex items-center gap-2 sm:gap-4 md:gap-6 px-2 sm:px-4 py-3 text-sm">
          <Link href="/dashboard" className="text-matrix crt-text font-bold whitespace-nowrap text-xs sm:text-sm flex-shrink-0">
            &lt;/&gt; ScriptLabOS
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex gap-1 flex-shrink">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`px-2 lg:px-3 py-1 rounded whitespace-nowrap text-xs lg:text-sm ${
                  pathname === n.href
                    ? "bg-matrix/15 text-matrix crt-text"
                    : "text-ink/70 hover:text-matrix"
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <span className="text-xs text-muted hidden sm:inline">
              ⌘K
            </span>
            <span className="text-[10px] sm:text-xs text-muted whitespace-nowrap">
              <span className="text-matrix">{current.name}</span>
              <span className="hidden sm:inline"> · {state.xp} XP · 🔥 {state.streak}</span>
            </span>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-matrix p-1"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 bg-bg/80 backdrop-blur-sm z-10"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Menu */}
          <div className="lg:hidden fixed top-[57px] left-0 right-0 z-20 panel border-t-0 !rounded-none shadow-glow">
            <nav className="flex flex-col">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 text-sm border-b border-matrix/10 ${
                    pathname === n.href
                      ? "bg-matrix/15 text-matrix crt-text"
                      : "text-ink/70 hover:bg-matrix/5 hover:text-matrix"
                  }`}
                >
                  {n.label}
                </Link>
              ))}
              <div className="px-4 py-3 text-xs text-muted border-b border-matrix/10">
                <div>💡 Press ⌘K for quick navigation</div>
                <div className="mt-1">
                  {state.xp} XP · 🔥 {state.streak} day streak
                </div>
              </div>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
