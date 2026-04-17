import type { Metadata } from "next";
import "./globals.css";
import { ScriptLabProvider } from "@/lib/ScriptLabProvider";
import AchievementToasts from "@/components/AchievementToasts";
import CommandPalette from "@/components/CommandPalette";

export const metadata: Metadata = {
  title: "ScriptLabOS by GOACTO",
  description:
    "You are the developer of your own life. Visualize and edit your daily scripts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme');
                if (theme === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                  if (!theme) localStorage.setItem('theme', 'dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="scanlines">
        <ScriptLabProvider>
          {children}
          <AchievementToasts />
          <CommandPalette />
        </ScriptLabProvider>
      </body>
    </html>
  );
}
