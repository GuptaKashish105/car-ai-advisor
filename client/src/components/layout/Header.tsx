import { ThemeToggle } from "./ThemeToggle";
import "./Header.css";

/** Small automotive-themed accent mark — deliberately simple (single-color
 * line icon), not a photo or illustration, so it stays lightweight. */
function CarBadgeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="app-header__icon-mark">
      <path
        d="M4 16v-2.6c0-.5.15-1 .43-1.4l1.6-2.3A2 2 0 0 1 7.66 9h8.68a2 2 0 0 1 1.63.85l1.6 2.3c.28.4.43.9.43 1.4V16"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M4 16h16v2a1 1 0 0 1-1 1h-1.2a1 1 0 0 1-1-.8l-.1-.5H7.3l-.1.5a1 1 0 0 1-1 .8H5a1 1 0 0 1-1-1v-2Z" fill="currentColor" />
      <path d="M6.5 9.5 8 6.7A1 1 0 0 1 8.9 6.2h6.2a1 1 0 0 1 .9.5l1.5 2.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Header() {
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <div className="app-header__brand">
          <div className="app-header__icon" aria-hidden="true">
            <CarBadgeIcon />
          </div>
          <div>
            <h1 className="app-header__title">Car AI Advisor</h1>
            <p className="app-header__tagline">
              AI-guided recommendations that turn a wide-open search into a confident, short list.
            </p>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
