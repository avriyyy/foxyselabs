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
        // Background tokens
        background: "#1e0f13",
        surface: "#1e0f13",
        "surface-1": "#111113",
        "surface-2": "#161619",
        "surface-dim": "#1e0f13",
        "surface-container-lowest": "#190a0e",
        "surface-container-low": "#27171b",
        "surface-container": "#2c1b1f",
        "surface-container-high": "#372529",
        "surface-container-highest": "#433034",
        "surface-bright": "#483439",
        "surface-tint": "#ffb1c5",
        "surface-variant": "#433034",
        "inverse-surface": "#fadbe1",

        // Pink neon
        "pink-neon": "#FF007F",
        "pink-glow": "rgba(255, 0, 127, 0.12)",
        "pink-muted": "#A31D56",
        "primary-container": "#ff4a8e",
        "primary-fixed": "#ffd9e1",
        "primary-fixed-dim": "#ffb1c5",
        "primary": "#ffb1c5",
        "inverse-primary": "#ba005c",
        "on-primary": "#65002f",
        "on-primary-container": "#590028",
        "on-primary-fixed": "#3f001b",
        "on-primary-fixed-variant": "#8f0045",

        // Text
        "on-surface": "#fadbe1",
        "on-surface-variant": "#e3bdc5",
        "on-background": "#fadbe1",
        "text-subtle": "#94949E",
        "text-muted": "#4E4E54",
        "inverse-on-surface": "#3e2b30",

        // Status
        success: "#00FFCC",
        warning: "#FFAA00",
        error: "#FF3333",
        "error-container": "#93000a",
        "on-error": "#690005",
        "on-error-container": "#ffdad6",
        tertiary: "#5fe060",
        "tertiary-container": "#19a72f",
        "on-tertiary": "#003908",
        "on-tertiary-container": "#003206",

        // Secondary
        secondary: "#c8c6c7",
        "secondary-container": "#4a494a",
        "on-secondary-container": "#bab8b9",
        "secondary-fixed": "#e5e2e3",
        "secondary-fixed-dim": "#c8c6c7",
        "on-secondary-fixed": "#1c1b1c",
        "on-secondary-fixed-variant": "#474647",

        // Borders
        outline: "#aa888f",
        "outline-variant": "#5b3f46",
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        full: "0.75rem",
      },
      spacing: {
        "gutter-desktop": "24px",
        "margin-desktop": "32px",
        "max-width": "1200px",
        "gutter-mobile": "16px",
        "margin-mobile": "16px",
      },
      fontFamily: {
        "display-md": ["var(--font-display)", "sans-serif"],
        "headline-lg": ["var(--font-display)", "sans-serif"],
        "label-mono": ["var(--font-mono)", "monospace"],
        "body-sm": ["var(--font-body)", "sans-serif"],
        "body-md": ["var(--font-body)", "sans-serif"],
        "display-lg": ["var(--font-display)", "sans-serif"],
      },
      fontSize: {
        "display-md": ["2.5rem", { lineHeight: "1.2", fontWeight: "600" }],
        "headline-lg": ["1.5rem", { lineHeight: "1.4", fontWeight: "600" }],
        "label-mono": ["0.75rem", { lineHeight: "1", fontWeight: "500" }],
        "body-sm": ["0.875rem", { lineHeight: "1.5", fontWeight: "400" }],
        "body-md": ["1rem", { lineHeight: "1.6", fontWeight: "400" }],
        "display-lg": ["3.5rem", { lineHeight: "1.1", fontWeight: "700" }],
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
