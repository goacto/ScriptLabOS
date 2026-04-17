import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ScriptLabProvider } from "@/lib/ScriptLabProvider";
import AchievementToasts from "@/components/AchievementToasts";
import CommandPalette from "@/components/CommandPalette";

export const metadata: Metadata = {
  title: "ScriptLab by GOACTO",
  description:
    "You are the developer of your own life. Visualize and edit your daily scripts.",
  appleWebApp: {
    capable: true,
    title: "ScriptLab",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#04070a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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
