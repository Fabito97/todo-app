"use client";

import { useState, useEffect, useCallback } from "react";
import { getStoredTheme, setStoredTheme, type ThemePreference } from "@/services";

function applyThemeToDocument(preference: ThemePreference) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  if (preference === "dark") {
    root.classList.add("dark");
  } else if (preference === "light") {
    root.classList.remove("dark");
  } else {
    const prefersDark =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (prefersDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemePreference>(() => getStoredTheme());

  useEffect(() => {
    applyThemeToDocument(theme);

    if (
      theme !== "system" ||
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyThemeToDocument("system");

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  const setTheme = useCallback((nextTheme: ThemePreference) => {
    setThemeState(nextTheme);
    setStoredTheme(nextTheme);
    applyThemeToDocument(nextTheme);
  }, []);

  return { theme, setTheme };
}
