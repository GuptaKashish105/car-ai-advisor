import type { RecommendationRequestStatus } from "../../hooks/useRecommendations";
import type { RecommendationResponse } from "../../types";
import { RecommendationCard } from "./RecommendationCard";
import { RecommendationCardSkeleton } from "./RecommendationCardSkeleton";
import "./results.css";
import "./RecommendationsSection.css";

interface RecommendationsSectionProps {
  status: RecommendationRequestStatus;
  data: RecommendationResponse | null;
  error: string | null;
  /** Re-runs the last submitted search — wired to useRecommendations().retry
   * in App.tsx. Only ever invoked from the error state's "Try again" button. */
  onRetry: () => void;
}

const SKELETON_COUNT = 3;

function SearchOffIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className="results-status__icon">
      <circle cx="27" cy="27" r="15" stroke="currentColor" strokeWidth="2.5" />
      <path d="M38 38 51 51" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M20 27h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className="results-status__icon">
      <circle cx="32" cy="32" r="21" stroke="currentColor" strokeWidth="2.5" />
      <path d="M32 22v14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="32" cy="42.5" r="1.9" fill="currentColor" />
    </svg>
  );
}

function CheckBadgeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="results-section__icon">
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15" />
      <path
        d="M7.5 12.5 10.5 15.5 16.5 8.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RetryIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="results-status__button-icon">
      <path d="M16.5 10a6.5 6.5 0 1 1-2-4.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M16.7 3.5v3.8h-3.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Renders the four outcomes of a recommendation request: nothing yet
 * (idle), in progress (loading), a friendly message on failure (error), and
 * either a "no matches" message or a grid of cards on success. This is the
 * only component that branches on `status` — RecommendationCard itself
 * doesn't know a request even exists.
 */
export function RecommendationsSection({ status, data, error, onRetry }: RecommendationsSectionProps) {
  if (status === "idle") {
    return null;
  }

  if (status === "loading") {
    return (
      <section className="results-section" aria-live="polite">
        <p className="results-section__loading-label">Finding your shortlist…</p>
        <div className="results-section__grid" aria-hidden="true">
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <RecommendationCardSkeleton key={index} />
          ))}
        </div>
      </section>
    );
  }

  if (status === "error") {
    return (
      <section className="results-section" aria-live="polite">
        <div className="results-status results-status--error" role="alert">
          <ErrorIcon />
          <h2 className="results-status__heading">Something went wrong</h2>
          <p className="results-status__message">{error}</p>
          <button type="button" className="results-status__retry" onClick={onRetry}>
            <RetryIcon />
            Try again
          </button>
        </div>
      </section>
    );
  }

  if (!data || data.results.length === 0) {
    return (
      <section className="results-section" aria-live="polite">
        <div className="results-status">
          <SearchOffIcon />
          <h2 className="results-status__heading">No matches yet</h2>
          <p className="results-status__message">
            Nothing fits those exact preferences. Try widening your budget, dropping a must-have, or turning down a
            priority to see more options.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="results-section" aria-live="polite">
      <div className="results-section__intro">
        <CheckBadgeIcon />
        <div>
          <h2 className="results-section__heading">Your shortlist</h2>
          <p className="results-section__subheading">
            {data.results.length} {data.results.length === 1 ? "car" : "cars"} ranked to fit what matters most to
            you.
          </p>
        </div>
      </div>
      <div className="results-section__grid">
        {data.results.map((result) => (
          <RecommendationCard key={result.car.id} result={result} />
        ))}
      </div>
    </section>
  );
}
