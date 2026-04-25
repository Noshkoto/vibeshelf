import type { Config } from "tailwindcss";

// Colors are CSS-variable-backed so they can be flipped for light mode
// without touching any className across the codebase. See app/globals.css
// for the dark defaults and the `.light` override set.
const rgb = (name: string) => `rgb(var(--color-${name}) / <alpha-value>)`;

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: rgb("ink"),
          soft: rgb("ink-soft"),
          mid: rgb("ink-mid"),
          line: rgb("ink-line"),
        },
        paper: {
          DEFAULT: rgb("paper"),
          soft: rgb("paper-soft"),
          dim: rgb("paper-dim"),
        },
        acid: rgb("acid"),
        ember: rgb("ember"),
        dusk: rgb("dusk"),
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
      boxShadow: {
        // Offset-print shadows stay dark in both modes — a shadow is a shadow.
        keycap:
          "inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -2px 0 rgba(0,0,0,0.5), 0 2px 0 #0B0B0A, 0 4px 16px rgba(0,0,0,0.4)",
        "keycap-pressed":
          "inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.4), 0 1px 0 #0B0B0A",
        offset: "4px 4px 0 0 #0B0B0A",
        "offset-sm": "3px 3px 0 0 #0B0B0A",
        "offset-paper": "4px 4px 0 0 #F4EAD5",
      },
      keyframes: {
        "dash-march": {
          to: { "stroke-dashoffset": "-24" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "draw-in": {
          from: { transform: "scaleX(0)" },
          to: { transform: "scaleX(1)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "dash-march": "dash-march 0.6s linear infinite",
        "slide-up": "slide-up 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both",
        shimmer: "shimmer 3s linear infinite",
        marquee: "marquee 50s linear infinite",
        "draw-in": "draw-in 1.1s cubic-bezier(0.2, 0.8, 0.2, 1) 0.35s both",
        "fade-in-up": "fade-in-up 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
