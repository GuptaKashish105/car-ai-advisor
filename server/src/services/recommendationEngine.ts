import type { Car } from "../types/car.js";
import type { UserPreferences } from "../types/preferences.js";
import type { RecommendationResult } from "../types/recommendation.js";
import { applyHardFilters } from "./filterEngine.js";
import { generateMatchReasons } from "./matchReasons.js";
import { rankCars, scoreCars, selectTopN } from "./scoringEngine.js";

const DEFAULT_TOP_N = 3;

/**
 * End-to-end deterministic pipeline: hard filters -> weighted scoring ->
 * ranking -> top N -> match reasons. This is the entire recommendation
 * decision; it contains no AI calls, so it stays testable, fast, and
 * correct even if the Gemini-backed explanation layer is unavailable or
 * skipped. A future route/service can call this and simply attach an
 * `aiExplanation` string to each result afterward.
 */
export function getRecommendations(
  cars: Car[],
  preferences: UserPreferences,
  topN: number = DEFAULT_TOP_N,
): RecommendationResult {
  const { filtered, totalCandidates, filteredOutCount } = applyHardFilters(cars, preferences);

  const scored = scoreCars(filtered, preferences);
  const ranked = rankCars(scored);
  const top = selectTopN(ranked, topN);

  const results = top.map((scoredCar) => ({
    ...scoredCar,
    matchReasons: generateMatchReasons(scoredCar, preferences),
  }));

  return {
    results,
    meta: { totalCandidates, filteredOutCount },
  };
}
