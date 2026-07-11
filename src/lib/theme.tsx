import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "neutral" | "girl" | "boy";
const STORAGE_KEY = "parently.theme";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (t: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("neutral");

  // Hydrate from localStorage after mount (SSR-safe).
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (saved === "neutral" || saved === "girl" || saved === "boy") {
        setThemeState(saved);
        applyTheme(saved);
        return;
      }
    } catch {
      // ignore
    }
    applyTheme("neutral");
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    applyTheme(t);
    try {
      window.localStorage.setItem(STORAGE_KEY, t);
    } catch {
      // ignore
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

import heroNeutral from "@/assets/hero-neutral.jpg";
import heroGirl from "@/assets/hero-girl.jpg";
import heroBoy from "@/assets/hero-boy.jpg";
import heroPregnancy from "@/assets/hero-pregnancy.jpg";

export const THEME_PHOTOS: Record<Theme, string> = {
  neutral: heroNeutral,
  girl: heroGirl,
  boy: heroBoy,
};

export const PREGNANCY_PHOTO = heroPregnancy;

export const THEME_LABELS: Record<Theme, string> = {
  neutral: "We don't know yet",
  girl: "It's a girl",
  boy: "It's a boy",
};
