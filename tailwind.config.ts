import type { Config } from "tailwindcss";

// In Tailwind v4, theme is defined via @theme in CSS (globals.css)
// This file only needed for content scanning
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};
export default config;
