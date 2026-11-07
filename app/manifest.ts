import type { MetadataRoute } from "next";
import {
  PWA_BACKGROUND_COLOR,
  PWA_DESCRIPTION,
  PWA_ICONS,
  PWA_NAME,
  PWA_THEME_COLOR,
} from "@/lib/pwa";
import { ONE_TAP_RUN_URL } from "@/lib/oneTap";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: PWA_NAME,
    short_name: PWA_NAME,
    description: PWA_DESCRIPTION,
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: PWA_BACKGROUND_COLOR,
    theme_color: PWA_THEME_COLOR,
    lang: "en",
    icons: PWA_ICONS,
    shortcuts: [
      {
        name: "Start a 25-min run",
        short_name: "Run 25 min",
        description: "Open the Tester and start a 25-minute session right away.",
        url: ONE_TAP_RUN_URL,
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
    ],
  };
}
