import type { RecommendationRequestStatus } from "../../hooks/useRecommendations";
import type { RecommendationResponse } from "../../types";

interface RecommendationsDebugPanelProps {
  status: RecommendationRequestStatus;
  data: RecommendationResponse | null;
  error: string | null;
  errorDetails: unknown;
}

/**
 * Placeholder for the real results UI (cards, scores, AI explanations).
 * Its only job is to make the four request outcomes — loading, success,
 * empty results, error — visible and inspectable while that UI doesn't
 * exist yet. Delete this file and its usage in App.tsx once results cards
 * land; nothing else depends on it.
 */
export function RecommendationsDebugPanel({ status, data, error, errorDetails }: RecommendationsDebugPanelProps) {
  if (status === "idle") {
    return null;
  }

  return (
    <section aria-live="polite" className="debug-panel">
      <h2>API response (debug)</h2>

      {status === "loading" && <p>Finding your shortlist…</p>}

      {status === "error" && (
        <div role="alert">
          <p>{error}</p>
          {errorDetails !== undefined && <pre>{JSON.stringify(errorDetails, null, 2)}</pre>}
        </div>
      )}

      {status === "success" && data && (
        <>
          <p>
            {data.results.length === 0
              ? "No cars matched those preferences — try widening your budget or must-haves."
              : `${data.results.length} match(es) found.`}
          </p>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </>
      )}
    </section>
  );
}
