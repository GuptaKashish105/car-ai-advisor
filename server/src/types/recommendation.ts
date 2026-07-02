import type { Car } from "./car.js";
import type { ScoringCriterion } from "./preferences.js";

export type ScoreBreakdown = Record<ScoringCriterion, number>;

export interface ScoredCar {
  car: Car;
  /** 0-100 weighted match score. */
  score: number;
  breakdown: ScoreBreakdown;
  matchReasons: string[];
}

export interface RecommendationResult {
  results: ScoredCar[];
  meta: {
    totalCandidates: number;
    filteredOutCount: number;
  };
}
