import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sovereign Luminous Color Palette
        "sovereign": {
          // Golden Glow inspired by xAI
          gold: {
            50: "#fffdf0",
            100: "#fefce8",
            200: "#fef9c3",
            300: "#fef08a",
            400: "#fde047",
            500: "#facc15", // Primary Golden
            600: "#eab308",
            700: "#ca8a04",
            800: "#a16207",
            900: "#854d0e",
            950: "#713f12",
          },
          // Luminous variants
          luminous: {
            50: "#fafafa",
            100: "#f4f4f5",
            200: "#e4e4e7",
            300: "#d4d4d8",
            400: "#a1a1aa",
            500: "#71717a",
            600: "#52525b",
            700: "#3f3f46",
            800: "#27272a",
            900: "#18181b",
            950: "#09090b",
          },
          // Sovereign Sun gradients
          sun: {
            50: "rgba(250, 204, 21, 0.05)",
            100: "rgba(250, 204, 21, 0.1)",
            200: "rgba(250, 204, 21, 0.15)",
            300: "rgba(250, 204, 21, 0.2)",
            400: "rgba(250, 204, 21, 0.25)",
            500: "rgba(250, 204, 21, 0.3)",
          }
        },
        // Enhanced existing colors with golden variants
        emerald: {
          DEFAULT: "#10b981",
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22",
          // Golden emerald blend
          gold: {
            50: "#f0fdf4",
            100: "#dcfce7",
            200: "#bbf7d0",
            300: "#86efac",
            400: "#4ade80",
            500: "#22c55e",
            600: "#16a34a",
            700: "#15803d",
            800: "#166534",
            900: "#14532d",
            950: "#052e16",
          }
        }
      },
      borderRadius: {
        "sovereign": "0.75rem", // 12px for premium feel
        "luminous": "1rem", // 16px for elevated cards
        "cosmic": "1.5rem", // 24px for special containers
      },
      boxShadow: {
        "sovereign-gold": "0 0 20px rgba(250, 204, 21, 0.15), 0 0 40px rgba(250, 204, 21, 0.05)",
        "sovereign-gold-lg": "0 0 30px rgba(250, 204, 21, 0.25), 0 0 60px rgba(250, 204, 21, 0.1)",
        "luminous-border": "0 0 0 1px rgba(250, 204, 21, 0.3), 0 0 20px rgba(250, 204, 21, 0.1)",
        "cosmic-glow": "0 0 40px rgba(250, 204, 21, 0.2), inset 0 0 20px rgba(250, 204, 21, 0.05)",
      },
      backdropBlur: {
        "sovereign": "24px",
        "luminous": "32px",
      },
      animation: {
        "sovereign-pulse": "sovereign-pulse 3s ease-in-out infinite",
        "luminous-float": "luminous-float 6s ease-in-out infinite",
        "golden-shimmer": "golden-shimmer 2s ease-in-out infinite",
      },
      keyframes: {
        "sovereign-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 20px rgba(250, 204, 21, 0.15), 0 0 40px rgba(250, 204, 21, 0.05)",
          },
          "50%": {
            boxShadow: "0 0 30px rgba(250, 204, 21, 0.25), 0 0 60px rgba(250, 204, 21, 0.1)",
          },
        },
        "luminous-float": {
          "0%, 100%": {
            transform: "translateY(0px)",
          },
          "50%": {
            transform: "translateY(-10px)",
          },
        },
        "golden-shimmer": {
          "0%": {
            backgroundPosition: "0% 50%",
          },
          "100%": {
            backgroundPosition: "100% 50%",
          },
        },
      },
      backgroundImage: {
        "sovereign-sun": "radial-gradient(circle at 20% 20%, rgba(250, 204, 21, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(250, 204, 21, 0.08) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(250, 204, 21, 0.05) 0%, transparent 70%)",
        "luminous-mesh": "linear-gradient(135deg, rgba(250, 204, 21, 0.1) 0%, rgba(16, 185, 129, 0.05) 50%, rgba(59, 130, 246, 0.05) 100%)",
        "golden-gradient": "linear-gradient(135deg, #facc15 0%, #eab308 50%, #ca8a04 100%)",
      },
    },
  },
  plugins: [],
}

export default config
