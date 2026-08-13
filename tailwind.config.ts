import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FAF9F6", // Warm alabaster paper background
        surface: "#FDFCFA",    // Subtle off-white surface
        card: "#FFFFFF",
        border: "#EBE7E0",     // Warm subtle border
        accent: {
          DEFAULT: "#1A365D",  // Premium deep navy
          light: "#2B5C8F",    // Medium blue slate
          sage: "#3F5144",     // Forest sage green
          gold: "#A3704C",     // Warm gold/brass accent
        },
        foreground: "#1C1A17", // Charcoal/near-black body text
        muted: "#5F5B54",      // Medium dark gray for subtext
        "muted-dark": "#8C867E", // Lighter gray for borders/hints
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["Georgia", "Merriweather", "serif"],
      },
      backgroundImage: {
        "accent-gradient": "linear-gradient(135deg, #1A365D 0%, #2B5C8F 100%)",
        "radial-fade": "radial-gradient(circle at 50% 0%, rgba(26,54,93,0.03), transparent 75%)",
        "mesh": "radial-gradient(at 10% 10%, rgba(26,54,93,0.02) 0px, transparent 40%), radial-gradient(at 90% 10%, rgba(63,81,68,0.02) 0px, transparent 40%)",
      },
      animation: {
        "gradient-x": "gradient-x 8s ease infinite",
        "float": "float 6s ease-in-out infinite",
        "float-slow": "float 9s ease-in-out infinite",
        "marquee": "marquee 40s linear infinite",
        "pulse-glow": "pulse-glow 2.4s ease-in-out infinite",
        "dash": "dash 1.4s linear infinite",
      },
      keyframes: {
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(1.15)" },
        },
        dash: {
          to: { strokeDashoffset: "-24" },
        },
      },
      letterSpacing: {
        tightest: "-0.045em",
      },
      maxWidth: {
        "8xl": "90rem",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
