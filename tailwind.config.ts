import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // The duck palette 🦆 — kept intact, used with intention.
        duck: {
          50: "#fffbeb",
          100: "#fff3c4",
          200: "#ffe588",
          300: "#ffd54a",
          400: "#ffc41f",
          500: "#f7b500", // primary duck yellow
          600: "#d99400",
          700: "#a86d00",
        },
        bill: {
          // Burnt / bill orange — the accent + title colour. Used sparingly.
          400: "#ff9d4d",
          500: "#ff7a18",
          600: "#ed5e00", // primary accent for titles & CTAs
          700: "#b84800", // AA-legible orange text on light tints
        },
        sky: {
          200: "#bfe7ff",
          300: "#8fd6ff",
          400: "#54bdff",
          500: "#2aa3f5",
          600: "#1377b8",
          700: "#0d567f",
        },
        pond: {
          300: "#9be7c4",
          400: "#5fd6a0",
          500: "#2bbd86",
          600: "#1c9a6c",
          700: "#127853",
        },
        // ---- Warm neutral layer (the professionalism) -------------------
        // A cream canvas, a warm near-black ink for real type hierarchy, and
        // a taupe "bark" scale for muted copy, borders and surfaces. This is
        // what stops the UI from reading as "everything is yellow-brown".
        cream: {
          50: "#fffdf8",
          100: "#fff8ee",
          200: "#fdf1e1",
        },
        ink: {
          DEFAULT: "#241a12", // headings / strong body
          soft: "#43382c", // standard body
          muted: "#6d6052", // secondary copy
        },
        bark: {
          100: "#f3ece1",
          200: "#e9ddca", // hairline borders
          300: "#dccab0",
          400: "#bda88c",
          500: "#8c7a64",
          600: "#5f5142",
          700: "#473b2e",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        // Fluid display tiers with a confident jump between each.
        "display-xl": [
          "clamp(2.5rem, 1.6rem + 4.2vw, 4.25rem)",
          { lineHeight: "1.02", letterSpacing: "-0.02em" },
        ],
        "display-lg": [
          "clamp(1.9rem, 1.4rem + 2.4vw, 2.75rem)",
          { lineHeight: "1.08", letterSpacing: "-0.018em" },
        ],
        eyebrow: [
          "0.75rem",
          { lineHeight: "1", letterSpacing: "0.18em" },
        ],
      },
      borderRadius: {
        // Contained, grown-up corners — no blobby 5xl.
        button: "0.75rem",
        card: "1.15rem",
        field: "0.7rem",
        "4xl": "2rem",
      },
      boxShadow: {
        // Soft, layered elevation only. The hard "game button" drop is gone.
        button: "0 1px 2px rgba(54, 35, 12, 0.10), 0 1px 1px rgba(54, 35, 12, 0.04)",
        accent: "0 6px 18px -6px rgba(237, 94, 0, 0.45), 0 2px 4px rgba(237, 94, 0, 0.18)",
        "accent-lg": "0 14px 32px -10px rgba(237, 94, 0, 0.50)",
        card: "0 1px 3px rgba(60, 42, 16, 0.05), 0 10px 30px -16px rgba(60, 42, 16, 0.20)",
        "card-lift": "0 2px 6px rgba(60, 42, 16, 0.06), 0 22px 48px -22px rgba(60, 42, 16, 0.28)",
        field: "inset 0 1px 2px rgba(54, 35, 12, 0.05)",
      },
      keyframes: {
        "float-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pop-in": {
          "0%": { transform: "scale(0.94)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "float-slow": "float-slow 6s ease-in-out infinite",
        "fade-up": "fade-up 0.6s cubic-bezier(0.22, 0.61, 0.36, 1) both",
        "pop-in": "pop-in 0.35s cubic-bezier(0.22, 0.61, 0.36, 1) both",
        shimmer: "shimmer 1.6s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
