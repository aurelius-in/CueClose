import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cue: {
          green: "#01A25B",
          "green-deep": "#018A4E",
          navy: "#012F5D",
          mist: "#E7F3EC",
          paper: "#F4F8F6",
          ink: "#0B1C2C",
          slate: "#4A5D73",
          line: "#C9D8CF",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        panel: "0 18px 50px rgba(1, 47, 93, 0.08)",
      },
      backgroundImage: {
        "cue-radial":
          "radial-gradient(1200px 600px at 10% -10%, rgba(1,162,91,0.18), transparent 55%), radial-gradient(900px 500px at 90% 0%, rgba(1,47,93,0.14), transparent 50%)",
        "cue-grid":
          "linear-gradient(rgba(1,47,93,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(1,47,93,0.04) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "28px 28px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.45" },
          "50%": { opacity: "0.9" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.55s ease-out both",
        "pulse-soft": "pulseSoft 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
