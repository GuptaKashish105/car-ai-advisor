import type { Car } from "../types/car.js";
import type { MustHave, ScoringCriterion, UserPreferences } from "../types/preferences.js";
import type { ScoredCar } from "../types/recommendation.js";

const STRENGTH_THRESHOLD = 75;

const CRITERION_LABELS: Record<ScoringCriterion, string> = {
  price: "Fits squarely within your budget",
  reliability: "Above-average reliability for its class",
  fuelEconomy: "Excellent fuel economy for its class",
  performance: "Strong acceleration and power for its class",
  space: "Generous cargo and seating space",
  safety: "Top-tier safety rating",
};

function mustHaveLabel(car: Car, mustHave: MustHave): string | null {
  switch (mustHave) {
    case "awd":
      return car.drivetrain === "awd" || car.drivetrain === "4wd"
        ? "Comes with the AWD/4WD you required"
        : null;
    case "hybrid":
      return car.fuelType === "hybrid" ? "Hybrid powertrain, as required" : null;
    case "ev":
      return car.fuelType === "ev" ? "Fully electric, as required" : null;
    case "third-row":
      return car.seating >= 7 ? "Seats 7+, meeting your third-row requirement" : null;
    case "manual":
      return car.transmission === "manual" ? "Available with the manual transmission you wanted" : null;
  }
}

function mustHaveReasons(car: Car, mustHaves?: MustHave[]): string[] {
  if (!mustHaves || mustHaves.length === 0) {
    return [];
  }
  return mustHaves
    .map((mustHave) => mustHaveLabel(car, mustHave))
    .filter((reason): reason is string => reason !== null);
}

/**
 * Ranks each strong criterion by how much the buyer said it mattered
 * (weight × score), so the reason surfaced first is the one most relevant
 * to *this* buyer, not just whichever attribute happens to be highest.
 */
function strengthReasons(scoredCar: ScoredCar, preferences: UserPreferences): string[] {
  const { breakdown } = scoredCar;
  const criteria = Object.keys(breakdown) as ScoringCriterion[];

  return criteria
    .filter((criterion) => breakdown[criterion] >= STRENGTH_THRESHOLD)
    .sort((a, b) => {
      const weightedA = breakdown[a] * preferences.priorities[a];
      const weightedB = breakdown[b] * preferences.priorities[b];
      return weightedB - weightedA;
    })
    .map((criterion) => CRITERION_LABELS[criterion]);
}

/**
 * Produces short, deterministic, data-backed reasons a car made the
 * shortlist. Must-have matches always lead (they were non-negotiable),
 * followed by whichever scored criteria are both strong and important to
 * this buyer. No AI involved — this has to hold up even if the Gemini call
 * that adds prose explanations later fails or is skipped.
 */
export function generateMatchReasons(scoredCar: ScoredCar, preferences: UserPreferences, maxReasons = 3): string[] {
  const required = mustHaveReasons(scoredCar.car, preferences.mustHaves);
  const strengths = strengthReasons(scoredCar, preferences);

  const reasons = Array.from(new Set([...required, ...strengths]));

  if (reasons.length === 0) {
    return ["A well-rounded option that balances your stated priorities"];
  }

  return reasons.slice(0, maxReasons);
}
