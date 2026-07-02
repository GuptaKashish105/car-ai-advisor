import type { BodyType } from "./car.js";

export type MustHave = "awd" | "hybrid" | "ev" | "third-row" | "manual";

export type PrimaryUse = "commute" | "family" | "offroad" | "first-car" | "towing";

export interface Budget {
  min: number;
  max: number;
}

/**
 * Relative weights the buyer assigns to each scoring criterion.
 * Values are arbitrary positive numbers (e.g. 1-5) — the scoring
 * engine normalizes them internally, so callers don't need to
 * make them sum to any particular total.
 */
export interface Priorities {
  price: number;
  reliability: number;
  fuelEconomy: number;
  performance: number;
  space: number;
  safety: number;
}

export type ScoringCriterion = keyof Priorities;

export interface UserPreferences {
  budget: Budget;
  primaryUse?: PrimaryUse;
  bodyTypes?: BodyType[];
  mustHaves?: MustHave[];
  priorities: Priorities;
}
