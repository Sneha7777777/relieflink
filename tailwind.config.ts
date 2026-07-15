import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          500: "#0284c7",
          600: "#0369a1",
          700: "#075985",
        },
        urgent: {
          low: "#16a34a",
          medium: "#d97706",
          high: "#dc2626",
          critical: "#7f1d1d",
        },
      },
      borderRadius: { xl: "0.875rem" },
    },
  },
  plugins: [],
};
export default config;
