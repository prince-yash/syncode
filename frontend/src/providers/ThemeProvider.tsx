import { useCallback, useEffect, useState, type ReactNode } from "react";
import { ThemeContext } from "./themeContext";
import type { Theme } from "./themeTypes";
const STORAGE_KEY = "syncode.theme.v1";

function getInitialTheme(): Theme {
  try {
    return localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#10110f" : "#f6f7f5");
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // The selected theme remains active for this page view.
    }
  }, [theme]);

  const setTheme = useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
