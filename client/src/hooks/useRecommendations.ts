import { useCallback, useState } from "react";
import { ApiError } from "../api/client";
import { getRecommendations } from "../api/recommendations";
import type { RecommendationResponse, UserPreferences } from "../types";

export type RecommendationRequestStatus = "idle" | "loading" | "success" | "error";

export interface UseRecommendationsResult {
  status: RecommendationRequestStatus;
  data: RecommendationResponse | null;
  error: string | null;
  /** Raw server-provided error payload (e.g. Zod field errors on a 400),
   * kept separate from `error` so callers can show a plain message without
   * having to parse this themselves. */
  errorDetails: unknown;
  submit: (preferences: UserPreferences) => Promise<void>;
}

/**
 * `ApiError` means the server responded but rejected the request (400
 * validation, 500, etc). Anything else here is a `fetch` rejection — the
 * request never reached a server at all: DNS failure, connection refused,
 * offline, and so on.
 */
function toErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    return err.message;
  }
  return "Couldn't reach the server. Check your connection and that the API is running.";
}

/**
 * Owns the full request lifecycle for POST /api/recommendations: status,
 * the last successful response, and error state. Kept separate from any
 * component so the request logic is testable on its own and reusable if
 * more than one place ends up triggering a recommendation request.
 */
export function useRecommendations(): UseRecommendationsResult {
  const [status, setStatus] = useState<RecommendationRequestStatus>("idle");
  const [data, setData] = useState<RecommendationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<unknown>(undefined);

  const submit = useCallback(async (preferences: UserPreferences) => {
    setStatus("loading");
    setError(null);
    setErrorDetails(undefined);
    // Clear any previous results immediately — stale matches from a prior
    // submission shouldn't linger on screen while a new request is in flight.
    setData(null);

    try {
      const response = await getRecommendations(preferences);
      setData(response);
      setStatus("success");
    } catch (err) {
      setError(toErrorMessage(err));
      setErrorDetails(err instanceof ApiError ? err.details : undefined);
      setStatus("error");
    }
  }, []);

  return { status, data, error, errorDetails, submit };
}
