import type { Config } from "tailwindcss";
const { fontFamily } = require("tailwindcss/defaultTheme") // <-- Restore import

const config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Restore references to var(...)
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          // Restore references to var(...)
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          // Restore full HEX scale
          50: '#f4eef9', 100: '#e8dcf2', 200: '#d4bee6', 300: '#c0a0da', 400: '#ac82ce',
          500: '#9b6bc3', 600: '#8c5faf', 700: '#7c539a', 800: '#6c4785', 900: '#5b3b70',
        },
        secondary: {
          // Restore references to var(...)
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
          // Restore full HEX scale
          main: '#f28c6e', light: '#f7b4a0', dark: '#d9775c',
        },
        destructive: {
          // Restore references to var(...)
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          // Restore references to var(...)
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          // Restore references to var(...)
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
          // Restore full HEX scale
          mint: '#78c4a8', peach: '#f7a68f', sky: '#8db8d8',
        },
        popover: {
          // Restore references to var(...)
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          // Restore references to var(...)
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        // Restore functional and neutral scales
        success: { main: '#6bb384', light: '#e9f4ec', dark: '#5a9e72' },
        warning: { main: '#e8b548', light: '#fef6e0', dark: '#d1a13e' },
        error: { main: '#e07e8a', light: '#fcecee', dark: '#c97079' },
        info: { main: '#6ea8d6', light: '#e8f0fd', dark: '#5e94bf' },
        neutral: {
          white: '#fefcf9', black: '#1f2523', 50: '#faf9f6', 100: '#f2f0ec', 200: '#e5e3de',
          300: '#d7d5d0', 400: '#aeadab', 500: '#878784', 600: '#666663', 700: '#4a4a47',
          800: '#2f2f2d', 900: '#1f2523',
        },
        // Añadir blanco puro si no existe o ajustarlo
        white: '#ffffff',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      // Restore fontFamily extension
      fontFamily: {
        body: ["var(--font-body)", ...fontFamily.sans],
        heading: ["var(--font-heading)", ...fontFamily.sans],
        accent: ["var(--font-accent)", ...fontFamily.sans],
        sans: ["var(--font-body)", ...fontFamily.sans], // Manrope como sans por defecto
      },
      // Mantener keyframes y animation existentes
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "collapsible-down": {
          from: { height: "0" },
          to: { height: "var(--radix-collapsible-content-height)" },
        },
        "collapsible-up": {
          from: { height: "var(--radix-collapsible-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "animate-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "animate-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "slide-in-from-top": {
          from: { transform: "translateY(-100%)" },
          to: { transform: "translateY(0)" },
        },
        "slide-out-to-top": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(-100%)" },
        },
        "slide-in-from-bottom": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "slide-out-to-bottom": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(100%)" },
        },
        "slide-in-from-left": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-out-to-left": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-100%)" },
        },
        "slide-in-from-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-out-to-right": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(100%)" },
        },
        "zoom-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "zoom-out": {
          from: { opacity: "1", transform: "scale(1)" },
          to: { opacity: "0", transform: "scale(0.95)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "collapsible-down": "collapsible-down 0.2s ease-out",
        "collapsible-up": "collapsible-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "animate-in": "animate-in 0.3s ease-out",
        "animate-out": "animate-out 0.3s ease-in",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-out": "fade-out 0.3s ease-in",
        "slide-in-from-top": "slide-in-from-top 0.3s ease-out",
        "slide-out-to-top": "slide-out-to-top 0.3s ease-in",
        "slide-in-from-bottom": "slide-in-from-bottom 0.3s ease-out",
        "slide-out-to-bottom": "slide-out-to-bottom 0.3s ease-in",
        "slide-in-from-left": "slide-in-from-left 0.3s ease-out",
        "slide-out-to-left": "slide-out-to-left 0.3s ease-in",
        "slide-in-from-right": "slide-in-from-right 0.3s ease-out",
        "slide-out-to-right": "slide-out-to-right 0.3s ease-in",
        "zoom-in": "zoom-in 0.2s ease-out",
        "zoom-out": "zoom-out 0.2s ease-in",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config; 