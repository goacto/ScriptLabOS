import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#04070a",
        "bg-elev": "#0a1410",
        matrix: {
          DEFAULT: "#00ff9c",
          dim: "#00b36b",
          deep: "#006e42",
        },
        amber: {
          bug: "#ffb400",
        },
        virus: "#ff3860",
        ink: "#d6fff0",
        muted: "#6b8377",
      },
      fontFamily: {
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      boxShadow: {
        glow: "0 0 24px rgba(0, 255, 156, 0.35)",
        "glow-sm": "0 0 8px rgba(0, 255, 156, 0.35)",
      },
      animation: {
        flicker: "flicker 3s infinite",
        blink: "blink 1s step-end infinite",
        slideInRight: "slideInRight 0.4s ease-out",
      },
      keyframes: {
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        slideInRight: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
