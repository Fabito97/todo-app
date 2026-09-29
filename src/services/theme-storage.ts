export type ThemePreference = "light" | "dark" | "system";

const THEME_STORAGE_KEY = "theme:v1";

export function getStoredTheme(): ThemePreference {
  if (typeof window === "undefined") {
    return "system";
  }

  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (raw === "light" || raw === "dark" || raw === "system") {
      return raw;
    }
  } catch {
    // Ignore storage read errors and fall back to system
  }

  return "system";
}

export function setStoredTheme(theme: ThemePreference): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore storage write errors
  }
}
