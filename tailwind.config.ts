import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "natu-green": "#2c3e35",
        "natu-ochre": "#d4a574",
        "natu-sage": "#a4a478",
        "natu-dark": "#1e2e26",
        "natu-light": "#eef2ed",
      },
      fontFamily: {
        sans: ["Montserrat", "Segoe UI", "Tahoma", "Geneva", "Verdana", "sans-serif"],
      },
      boxShadow: {
        natu: "0 20px 60px rgba(0, 0, 0, 0.3)",
        "natu-soft": "0 12px 30px rgba(15, 23, 42, 0.08)",
      },
      keyframes: {
        "fade-in-down": {
          "0%": { opacity: "0", transform: "translateY(-24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "natu-pulse": {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
        shake: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "10%": { transform: "translate(-2px, 2px)" },
          "20%": { transform: "translate(2px, -2px)" },
          "30%": { transform: "translate(-2px, -2px)" },
          "40%": { transform: "translate(2px, 2px)" },
          "50%": { transform: "translate(-2px, 2px)" },
          "60%": { transform: "translate(2px, -2px)" },
          "70%": { transform: "translate(-2px, -2px)" },
          "80%": { transform: "translate(2px, 2px)" },
          "90%": { transform: "translate(2px, -2px)" },
        },
        "wave-expand": {
          "0%": { width: "0px", height: "0px", opacity: "1" },
          "100%": { width: "var(--wave-size, 300px)", height: "var(--wave-size, 300px)", opacity: "0" },
        },
      },
      animation: {
        "fade-in-down": "fade-in-down 0.9s ease-out both",
        "fade-in-up": "fade-in-up 0.9s ease-out 0.2s both",
        "natu-pulse": "natu-pulse 1.4s ease-in-out infinite",
        shake: "shake 0.35s linear infinite",
        "wave-expand": "wave-expand 2s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
