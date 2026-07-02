import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

/** Must match the storage key in the inline bootstrap script in index.html. */
const THEME_STORAGE_KEY = "car-ai-advisor-theme";

function prefersDarkScheme(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/**
 * Reads the theme index.html's inline script already applied to
 * `<html data-theme>` before React ever mounted — this hook picks up that
 * value rather than re-deciding it, so there's a single source of truth
 * for "what theme are we on" instead of two independent detections that
 * could disagree.
 */
function getInitialTheme(): Theme {
  const attr = document.documentElement.getAttribute("data-theme");
  if (attr === "light" || attr === "dark") {
    return attr;
  }
  return prefersDarkScheme() ? "dark" : "light";
}

/**
 * Theme state for the whole app. Applying the theme is a side effect on
 * `document.documentElement` (a `data-theme` attribute every component
 * stylesheet's `[data-theme="dark"]` selectors key off of) rather than
 * something passed down through props — no component in the tree needs to
 * know the current theme to render correctly, only this hook and the CSS.
 */
export function useTheme(): { theme: Theme; toggleTheme: () => void } {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Storage can throw in private-browsing / storage-disabled contexts —
      // theme still works for the session, it just won't persist.
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  return { theme, toggleTheme };
}
