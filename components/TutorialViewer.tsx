"use client";

import { useState } from "react";

const TUTORIALS = [
  {
    id: "overview",
    title: "📖 App Overview",
    description: "Understand the core concept",
    content: {
      title: "Welcome to ScriptLabOS",
      sections: [
        {
          heading: "The Core Metaphor",
          text: "Your brain is a computer. Each habit is a script. Your day is code that runs. You are the developer of your own life.",
        },
        {
          heading: "Script Types",
          bullets: [
            "[OS] Baseline - Heartbeat habits (sleep, breathe, hydrate)",
            "[UPD] Update - Learning & skill practice",
            "[UP+] Upgrade - Identity-level paradigm shifts",
            "[BUG] Bug - Bad habits to patch",
            "[VIR] Virus - Limiting beliefs to delete",
          ],
        },
        {
          heading: "The Daily Workflow",
          bullets: [
            "Plan: Design your day in Day Builder",
            "Execute: Run scripts with Pomodoro Timer + reflection",
            "Review: End-of-day retrospective",
            "Ship: Lock in XP, streak, and patterns",
          ],
        },
      ],
    },
  },
  {
    id: "library",
    title: "📚 Script Library",
    description: "Create and manage your .gss files",
    content: {
      title: "Using the Library",
      sections: [
        {
          heading: "What is a .gss file?",
          text: "A GOACTO Self Script (.gss) is a single atomic habit or practice. Think of it as a function you can call in your life.",
        },
        {
          heading: "Creating Scripts",
          bullets: [
            "Click 'New .gss' and choose a type",
            "Give it a clear title (e.g., 'Morning Meditation')",
            "Set duration (default: 25 min Pomodoro)",
            "Write your intent: the 'why' behind this script",
            "Add steps: specific actions to take",
            "Tag with your core values",
          ],
        },
        {
          heading: "Organizing Scripts",
          bullets: [
            "Scripts auto-organize by type in the file tree",
            "Use tags to filter and find scripts",
            "Link scripts to your values for alignment tracking",
            "Import from templates to get started quickly",
          ],
        },
      ],
    },
  },
  {
    id: "day-builder",
    title: "🏗️ Day Builder",
    description: "Plan and track your daily build",
    content: {
      title: "Planning Your Day",
      sections: [
        {
          heading: "Building Your Day",
          bullets: [
            "Drag scripts or packages onto the timeline",
            "Scripts auto-claim time slots based on duration",
            "Status: Draft → In-Progress → Complete",
            "Watch your Execution Fidelity in real-time",
          ],
        },
        {
          heading: "The 3-Stage Workflow",
          bullets: [
            "Draft: Plan your ideal day (morning or night before)",
            "In-Progress: Execute throughout the day, track fidelity",
            "Complete: Review, reflect, and ship your build",
          ],
        },
        {
          heading: "Build Quality",
          text: "Your Execution Fidelity = (completed scripts / planned scripts) × 100. Aim for 80%+ for a green build!",
        },
        {
          heading: "End-of-Day Review",
          bullets: [
            "Required to ship your day",
            "Reflect on wins, challenges, tomorrow's focus",
            "Locks in XP and streak",
            "Helps you iterate and improve",
          ],
        },
      ],
    },
  },
  {
    id: "tester",
    title: "⏱️ Script Tester",
    description: "Run scripts with Pomodoro timer",
    content: {
      title: "Running Scripts",
      sections: [
        {
          heading: "The Pomodoro Method",
          bullets: [
            "Select a script from the dropdown",
            "Duration defaults to script's time (usually 25 min)",
            "Click 'Start' to begin your focus session",
            "Check off steps as you complete them",
            "When timer ends, mandatory reflection appears",
          ],
        },
        {
          heading: "Post-Session Reflection",
          text: "After each session, you must reflect on what worked, what didn't, and insights for improvement. This is your code review.",
        },
        {
          heading: "Earning XP",
          bullets: [
            "Complete the session",
            "Fill in reflection (required)",
            "XP = duration × type multiplier",
            "baseline ×1, update ×1.5, upgrade ×2, bug/virus ×3",
          ],
        },
      ],
    },
  },
  {
    id: "packages",
    title: "📦 Packages",
    description: "Bundle scripts into routines",
    content: {
      title: "Creating Packages",
      sections: [
        {
          heading: "What are Packages?",
          text: "Packages are bundles of scripts that run together. Think 'Morning Routine' or 'Weekly Review'. They're like functions that call multiple scripts.",
        },
        {
          heading: "Creating a Package",
          bullets: [
            "Go to /packages",
            "Click 'New Package'",
            "Give it a name (e.g., 'Power Morning')",
            "Select which scripts to include",
            "Total duration = sum of all scripts",
          ],
        },
        {
          heading: "Using Packages",
          bullets: [
            "Drag packages onto Day Builder timeline",
            "Package automatically claims the right number of slots",
            "Run each script individually in Tester",
            "Track completion at package level",
          ],
        },
      ],
    },
  },
  {
    id: "profile",
    title: "👤 Profile & Values",
    description: "Align your scripts with who you are",
    content: {
      title: "Your Developer Profile",
      sections: [
        {
          heading: "Wake-Up Statements",
          text: "These are your 'why' - statements in the form: 'I wake up to X so that Y so that Z.' They drive script recommendations.",
        },
        {
          heading: "Core Values",
          text: "3-5 principles that guide your decisions. Tag your scripts with values to ensure alignment. Examples: Growth, Courage, Health, Family.",
        },
        {
          heading: "Goals",
          text: "1-3 goals this OS serves. These help you stay focused on what matters and filter out what doesn't.",
        },
        {
          heading: "Why This Matters",
          bullets: [
            "Scripts tagged with your values get highlighted",
            "Recommendations match your wake-up statements",
            "Daily builds align with your goals",
            "Tracks whether you're living your values",
          ],
        },
      ],
    },
  },
  {
    id: "gamification",
    title: "🎮 XP, Levels & Achievements",
    description: "Track your growth journey",
    content: {
      title: "The Progression System",
      sections: [
        {
          heading: "XP & Levels",
          bullets: [
            "Earn XP by completing scripts",
            "Level up: Junior Dev → Dev → Senior Dev → Staff → Architect of Self",
            "Higher levels unlock new features (future)",
            "XP reflects actual time invested in growth",
          ],
        },
        {
          heading: "Streaks",
          text: "Consecutive days with at least one completed build. Maintains momentum and builds consistency.",
        },
        {
          heading: "Achievements",
          bullets: [
            "Unlock achievements for milestones",
            "First run, first build, first bug patched",
            "7-day streak, 30-day streak",
            "Achievements shown on dashboard and profile",
          ],
        },
        {
          heading: "Build Quality",
          text: "Your Execution Fidelity score shows how well you execute your plans. 80%+ = green build, 50-79% = yellow, <50% = red.",
        },
      ],
    },
  },
  {
    id: "reflection",
    title: "💭 Reflection System",
    description: "Code reviews for your life",
    content: {
      title: "The Power of Reflection",
      sections: [
        {
          heading: "Why Reflection is Mandatory",
          text: "Just like code reviews catch bugs before production, reflection helps you iterate on your life scripts. It's the meta-layer that drives improvement.",
        },
        {
          heading: "Post-Session Reflection",
          bullets: [
            "After each Pomodoro: What worked? What didn't? Insights?",
            "Required to log the session and earn XP",
            "Helps you debug bad scripts and upgrade good ones",
            "Builds self-awareness muscle",
          ],
        },
        {
          heading: "End-of-Day Reflection",
          bullets: [
            "Required to ship your daily build",
            "Wins, challenges, tomorrow's focus",
            "Locks in your streak and XP",
            "Creates a changelog of your growth",
          ],
        },
        {
          heading: "Growing & Contributing",
          text: "Reflection is how you grow yourself. Sharing your insights is how you contribute to others. Both are essential to the GOACTO mission.",
        },
      ],
    },
  },
];

interface TutorialViewerProps {
  onClose: () => void;
}

export default function TutorialViewer({ onClose }: TutorialViewerProps) {
  const [selectedTutorial, setSelectedTutorial] = useState<string | null>(null);

  const tutorial = TUTORIALS.find((t) => t.id === selectedTutorial);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/95 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              📘 How to Use ScriptLabOS
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Step-by-step guides to master the platform
            </p>
          </div>
          <button
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            onClick={onClose}
          >
            ✕ Close
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Sidebar - Tutorial List */}
          {!tutorial && (
            <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-gray-900">
              <div className="grid md:grid-cols-2 gap-4">
                {TUTORIALS.map((tut) => (
                  <button
                    key={tut.id}
                    onClick={() => setSelectedTutorial(tut.id)}
                    className="text-left p-5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all"
                  >
                    <div className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {tut.title}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {tut.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tutorial Content */}
          {tutorial && (
            <div className="flex-1 overflow-y-auto">
              <div className="p-8 bg-white dark:bg-gray-900">
                <button
                  onClick={() => setSelectedTutorial(null)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-4"
                >
                  ← Back to all tutorials
                </button>

                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                  {tutorial.content.title}
                </h1>

                <div className="space-y-8">
                  {tutorial.content.sections.map((section, idx) => (
                    <div key={idx} className="border-l-4 border-blue-500 pl-6">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                        {section.heading}
                      </h2>
                      {section.text && (
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                          {section.text}
                        </p>
                      )}
                      {section.bullets && (
                        <ul className="space-y-2">
                          {section.bullets.map((bullet, bidx) => (
                            <li
                              key={bidx}
                              className="flex items-start text-gray-700 dark:text-gray-300"
                            >
                              <span className="text-blue-500 mr-3 mt-1">•</span>
                              <span className="flex-1">{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                    💡 Tip: Practice makes perfect. The more you use these
                    features, the more natural they'll become. You're building
                    new habits - give yourself time to adjust.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
