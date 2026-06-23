import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // The duck palette 🦆
        duck: {
          // duck yellow
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
          // bill orange
          400: "#ff9d4d",
          500: "#ff7a18", // bill orange
          600: "#ed5e00",
        },
        sky: {
          // sky blue
          200: "#bfe7ff",
          300: "#8fd6ff",
          400: "#54bdff",
          500: "#2aa3f5",
          // Darker steps for AA-legible text on the light sky tints.
          600: "#1377b8",
          700: "#0d567f",
        },
        pond: {
          // pond green
          300: "#9be7c4",
          400: "#5fd6a0",
          500: "#2bbd86",
          600: "#1c9a6c",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.75rem",
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(247, 181, 0, 0.45)",
        "soft-lg": "0 24px 60px -20px rgba(237, 94, 0, 0.35)",
        pop: "0 6px 0 0 rgba(216, 148, 0, 1)",
      },
      keyframes: {
        "float-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "bob": {
          "0%, 100%": { transform: "translateY(0) rotate(-1.5deg)" },
          "50%": { transform: "translateY(-6px) rotate(1.5deg)" },
        },
        "waddle": {
          "0%, 100%": { transform: "rotate(-4deg)" },
          "50%": { transform: "rotate(4deg)" },
        },
        "ripple": {
          "0%": { transform: "scale(0.6)", opacity: "0.7" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
        "bubble-up": {
          "0%": { transform: "translateY(0) scale(1)", opacity: "0" },
          "20%": { opacity: "0.8" },
          "100%": { transform: "translateY(-120px) scale(0.4)", opacity: "0" },
        },
        "pop-in": {
          "0%": { transform: "scale(0.7)", opacity: "0" },
          "70%": { transform: "scale(1.06)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "celebrate": {
          "0%, 100%": { transform: "translateY(0) rotate(0)" },
          "25%": { transform: "translateY(-14px) rotate(-6deg)" },
          "50%": { transform: "translateY(0) rotate(0)" },
          "75%": { transform: "translateY(-8px) rotate(6deg)" },
        },
        "shimmer": {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "float-slow": "float-slow 4s ease-in-out infinite",
        "bob": "bob 2.6s ease-in-out infinite",
        "waddle": "waddle 0.5s ease-in-out infinite",
        "ripple": "ripple 2.4s ease-out infinite",
        "bubble-up": "bubble-up 3s ease-in infinite",
        "pop-in": "pop-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        "celebrate": "celebrate 1.1s ease-in-out infinite",
        "shimmer": "shimmer 1.6s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
