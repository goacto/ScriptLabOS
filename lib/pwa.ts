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
 * Home-screen icons are the approved R1 mark: a mint chevron and checklist
 * (#19F59B) on a near-black green field (#0F1D18 → #030706) with a faint grid.
 * Maskable art keeps that mark inside the center 80% safe circle and lets the
 * background bleed to the edges. Theme colors stay the app `--bg` (#04070a);
 * that near-black sits next to the icon without a clash.
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
