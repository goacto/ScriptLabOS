import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ScriptLabProvider } from "@/lib/ScriptLabProvider";
import AchievementToasts from "@/components/AchievementToasts";
import CommandPalette from "@/components/CommandPalette";
import UsagePing from "@/components/UsagePing";
import {
  PWA_APPLE_TOUCH_ICON,
  PWA_DESCRIPTION,
  PWA_ICONS,
  PWA_NAME,
  PWA_THEME_COLOR,
} from "@/lib/pwa";

export const metadata: Metadata = {
  applicationName: PWA_NAME,
  title: "ScriptLabOS by GOACTO",
  description: PWA_DESCRIPTION,
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
  themeColor: PWA_THEME_COLOR,
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
          <UsagePing />
        </ScriptLabProvider>
      </body>
    </html>
  );
}
