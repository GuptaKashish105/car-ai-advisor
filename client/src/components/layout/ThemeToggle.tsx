import { useTheme } from "../../hooks/useTheme";
import "./ThemeToggle.css";

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="theme-toggle__icon">
      <circle cx="12" cy="12" r="4.5" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M12 2.5v2.2" />
        <path d="M12 19.3v2.2" />
        <path d="M4.2 4.2l1.6 1.6" />
        <path d="M18.2 18.2l1.6 1.6" />
        <path d="M2.5 12h2.2" />
        <path d="M19.3 12h2.2" />
        <path d="M4.2 19.8l1.6-1.6" />
        <path d="M18.2 5.8l1.6-1.6" />
      </g>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="theme-toggle__icon">
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" fill="currentColor" />
    </svg>
  );
}

/**
 * Reflects and flips the app's current theme. Shows the icon for the
 * theme a click would switch *to* (sun while dark, moon while light) —
 * the aria-label spells out the action explicitly either way, so the
 * icon choice is a visual convention, not the source of meaning.
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={isDark}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
