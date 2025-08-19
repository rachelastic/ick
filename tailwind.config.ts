/** @type {import('tailwindcss').Config} */
export const content = [
  "./app/**/*.{ts,tsx}",
  "./pages/**/*.{ts,tsx}",
  "./components/**/*.{ts,tsx}",
  "./src/**/*.{ts,tsx}",
];
export const theme = {
  extend: {
    colors: {
      border: "oklch(var(--border) / <alpha-value>)",
      input: "oklch(var(--input) / <alpha-value>)",
      ring: "oklch(var(--ring) / <alpha-value>)",
      background: "oklch(var(--background) / <alpha-value>)",
      foreground: "oklch(var(--foreground) / <alpha-value>)",
      primary: "oklch(var(--primary) / <alpha-value>)",
      "primary-foreground": "oklch(var(--primary-foreground) / <alpha-value>)",
      secondary: "oklch(var(--secondary) / <alpha-value>)",
      "secondary-foreground":
        "oklch(var(--secondary-foreground) / <alpha-value>)",
      destructive: "oklch(var(--destructive) / <alpha-value>)",
      muted: "oklch(var(--muted) / <alpha-value>)",
      "muted-foreground": "oklch(var(--muted-foreground) / <alpha-value>)",
      accent: "oklch(var(--accent) / <alpha-value>)",
      "accent-foreground": "oklch(var(--accent-foreground) / <alpha-value>)",
      card: "oklch(var(--card) / <alpha-value>)",
      "card-foreground": "oklch(var(--card-foreground) / <alpha-value>)",
      popover: "oklch(var(--popover) / <alpha-value>)",
      "popover-foreground": "oklch(var(--popover-foreground) / <alpha-value>)",
    },
    borderRadius: {
      lg: "var(--radius)",
      md: "calc(var(--radius) - 2px)",
      sm: "calc(var(--radius) - 4px)",
    },
    keyframes: {
      gradientAnimation: {
        "0%": { backgroundPosition: "0% 50%" },
        "50%": { backgroundPosition: "100% 50%" },
        "100%": { backgroundPosition: "0% 50%" },
      },
    },
    animation: {
      gradient: "gradientAnimation 15s ease infinite",
    },
  },
};
export const plugins = [require("tailwindcss-animate")];
