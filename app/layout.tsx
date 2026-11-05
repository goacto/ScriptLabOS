import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ScriptLabProvider } from "@/lib/ScriptLabProvider";
import { TimerProvider } from "@/components/TimerProvider";
import AchievementToasts from "@/components/AchievementToasts";
import CommandPalette from "@/components/CommandPalette";
import RunningTimerChip from "@/components/RunningTimerChip";
import UsagePing from "@/components/UsagePing";
import {
  PWA_APPLE_TOUCH_ICON,
  PWA_ICONS,
  PWA_NAME,
} from "@/lib/pwa";

const SEO_DESCRIPTION =
  "ScriptLabOS by Team GOACTO. You are the developer of your own life. Visualize and edit your daily scripts. Growing Ourselves and Contributing To Others.";

export const metadata: Metadata = {
  applicationName: PWA_NAME,
  title: {
    default: "ScriptLabOS by Team GOACTO",
    template: "%s · ScriptLabOS",
  },
  description: SEO_DESCRIPTION,
  metadataBase: new URL("https://scriptlabos.goacto.com"),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "https://scriptlabos.goacto.com/",
    title: "ScriptLabOS by Team GOACTO",
    description: SEO_DESCRIPTION,
    siteName: "Team GOACTO",
  },
  twitter: {
    card: "summary",
    title: "ScriptLabOS by Team GOACTO",
    description: SEO_DESCRIPTION,
  },
  appleWebApp: {
    capable: true,
    title: PWA_NAME,
    statusBarStyle: "black-translucent",
  },
  // Next's appleWebApp.capable emits mobile-web-app-capable. iOS still
  // reads the apple-prefixed tag when launching from the home screen.
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      ...PWA_ICONS.filter((icon) => icon.purpose === "any").map((icon) => ({
        url: icon.src,
        sizes: icon.sizes,
        type: icon.type,
      })),
    ],
    apple: [
      {
        url: PWA_APPLE_TOUCH_ICON,
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Brand amber for browser chrome (audit #13); PWA splash still uses lib/pwa.
  themeColor: "#E8A33D",
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
          <TimerProvider>
            {children}
            <RunningTimerChip />
            <AchievementToasts />
            <CommandPalette />
            <UsagePing />
          </TimerProvider>
        </ScriptLabProvider>
      </body>
    </html>
  );
}
