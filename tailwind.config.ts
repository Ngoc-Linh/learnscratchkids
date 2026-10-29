import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#FFF6EC",
          100: "#FFE9D0",
          200: "#FFD0A0",
          400: "#FFA040",
          500: "#FF8A1F",
          600: "#E87208",
          700: "#C25B00",
        },
        scratch: {
          50: "#EEF5FF",
          100: "#D9E8FF",
          400: "#6FA9FF",
          500: "#4C97FF",
          600: "#2F7DEB",
          700: "#1F5FC0",
        },
        ink: "#1E2A4A",
      },
      fontFamily: {
        display: ['"Baloo 2"', "Nunito", '"Segoe UI"', "Arial", "sans-serif"],
        body: ["Nunito", '"Segoe UI"', "Arial", "Tahoma", "sans-serif"],
      },
      boxShadow: {
        pop: "0 4px 0 0 rgba(30, 42, 74, 0.15)",
        soft: "0 10px 30px -12px rgba(30, 42, 74, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
