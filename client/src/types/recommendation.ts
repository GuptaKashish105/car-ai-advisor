import type { Car } from "./car";
import type { ScoringCriterion } from "./preferences";

export type ScoreBreakdown = Record<ScoringCriterion, number>;

/** One shortlisted car as returned by the API — score, breakdown, deterministic
 * match reasons, and the Gemini-generated explanation (null if unavailable). */
export interface RecommendationResultItem {
  car: Car;
  score: number;
  breakdown: ScoreBreakdown;
  matchReasons: string[];
  aiExplanation: string | null;
}

export interface RecommendationMeta {
  totalCandidates: number;
  filteredOutCount: number;
}

/** Shape of the POST /api/recommendations response body. */
export interface RecommendationResponse {
  results: RecommendationResultItem[];
  meta: RecommendationMeta;
}
