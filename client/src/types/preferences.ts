import type { BodyType } from "./car";

export type MustHave = "awd" | "hybrid" | "ev" | "third-row" | "manual";
export type PrimaryUse = "commute" | "family" | "offroad" | "first-car" | "towing";

export interface Budget {
  min: number;
  max: number;
}

/** Relative weights the buyer assigns to each scoring criterion. */
export interface Priorities {
  price: number;
  reliability: number;
  fuelEconomy: number;
  performance: number;
  space: number;
  safety: number;
}

export type ScoringCriterion = keyof Priorities;

/** Shape of the POST /api/recommendations request body. */
export interface UserPreferences {
  budget: Budget;
  primaryUse?: PrimaryUse;
  bodyTypes?: BodyType[];
  mustHaves?: MustHave[];
  priorities: Priorities;
}
