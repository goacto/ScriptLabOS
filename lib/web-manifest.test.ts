import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import manifest from "@/app/manifest";
import {
  PWA_APPLE_TOUCH_ICON,
  PWA_BACKGROUND_COLOR,
  PWA_NAME,
  PWA_THEME_COLOR,
} from "@/lib/pwa";

function readPng(urlPath: string) {
  const file = path.join(process.cwd(), "public", urlPath);
  const buf = readFileSync(file);
  expect(buf.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  return {
    width: buf.readUInt32BE(16),
    height: buf.readUInt32BE(20),
    colorType: buf[25],
    bytes: buf.length,
  };
}

describe("web app manifest", () => {
  const data = manifest();

  it("names the installed app ScriptLabOS and launches at /", () => {
    expect(data.name).toBe(PWA_NAME);
    expect(data.short_name).toBe("ScriptLabOS");
    expect(data.start_url).toBe("/");
    expect(data.scope).toBe("/");
    expect(data.display).toBe("standalone");
    expect(data.prefer_related_applications).not.toBe(true);
  });

  it("matches the app dark theme", () => {
    expect(PWA_THEME_COLOR).toBe("#04070a");
    expect(data.theme_color).toBe("#04070a");
    expect(data.background_color).toBe(PWA_BACKGROUND_COLOR);
    expect(data.background_color).toBe(data.theme_color);
  });

  it("declares 192, 512, and 512 maskable PNG icons that exist", () => {
    const icons = data.icons ?? [];
    expect(icons.map((icon) => `${icon.sizes}:${icon.purpose}`)).toEqual([
      "192x192:any",
      "512x512:any",
      "512x512:maskable",
    ]);

    for (const icon of icons) {
      const [w, h] = icon.sizes!.split("x").map(Number);
      const png = readPng(icon.src);
      expect(png.width).toBe(w);
      expect(png.height).toBe(h);
      expect(png.colorType).toBe(2);
      expect(png.bytes).toBeGreaterThan(500);
      expect(icon.type).toBe("image/png");
    }
  });

  it("includes a 180px apple touch icon", () => {
    const png = readPng(PWA_APPLE_TOUCH_ICON);
    expect(png.width).toBe(180);
    expect(png.height).toBe(180);
    expect(png.colorType).toBe(2);
  });
});
