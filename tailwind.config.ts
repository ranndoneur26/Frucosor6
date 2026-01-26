
import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            fontFamily: {
                display: ["var(--font-display)", "sans-serif"],
            },
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                "background-light": "#f8fafc", // slate-50
                "background-dark": "#0f172a",  // slate-900
            },
        },
    },
    plugins: [],
};
export default config;
