import type { MetadataRoute } from "next";

/** Installed name on Android and iOS home screens. */
export const PWA_NAME = "ScriptLabOS";

export const PWA_DESCRIPTION =
  "You are the developer of your own life. Visualize and edit your daily scripts.";

/**
 * App dark background (`--bg` in globals.css). Used for the manifest
 * theme/background colors and the home-screen icon field so launch splash
 * matches the running app.
 */
export const PWA_THEME_COLOR = "#04070a";
export const PWA_BACKGROUND_COLOR = "#04070a";

export const PWA_APPLE_TOUCH_ICON = "/apple-touch-icon.png";

/**
 * The full GOACTO wordmark is too wide to read at home-screen size, so these
 * are a square gold slash (from the dark-background GOACTO mark) on #04070a.
 * Maskable art keeps the slash inside the center 80% safe circle.
 */
export const PWA_ICONS: NonNullable<MetadataRoute.Manifest["icons"]> = [
  {
    src: "/icons/icon-192.png",
    sizes: "192x192",
    type: "image/png",
    purpose: "any",
  },
  {
    src: "/icons/icon-512.png",
    sizes: "512x512",
    type: "image/png",
    purpose: "any",
  },
  {
    src: "/icons/icon-512-maskable.png",
    sizes: "512x512",
    type: "image/png",
    purpose: "maskable",
  },
];
