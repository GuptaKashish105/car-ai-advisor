import type { Car, BodyType } from "../types/car.js";
import type { MustHave, UserPreferences } from "../types/preferences.js";

export function filterByBudget(cars: Car[], budget: UserPreferences["budget"]): Car[] {
  return cars.filter((car) => car.price >= budget.min && car.price <= budget.max);
}

export function filterByBodyType(cars: Car[], bodyTypes?: BodyType[]): Car[] {
  if (!bodyTypes || bodyTypes.length === 0) {
    return cars;
  }
  const allowed = new Set(bodyTypes);
  return cars.filter((car) => allowed.has(car.bodyType));
}

function carSatisfiesMustHave(car: Car, mustHave: MustHave): boolean {
  switch (mustHave) {
    case "awd":
      return car.drivetrain === "awd" || car.drivetrain === "4wd";
    case "hybrid":
      return car.fuelType === "hybrid";
    case "ev":
      return car.fuelType === "ev";
    case "third-row":
      return car.seating >= 7;
    case "manual":
      return car.transmission === "manual";
  }
}

export function filterByMustHaves(cars: Car[], mustHaves?: MustHave[]): Car[] {
  if (!mustHaves || mustHaves.length === 0) {
    return cars;
  }
  return cars.filter((car) => mustHaves.every((mustHave) => carSatisfiesMustHave(car, mustHave)));
}

export interface HardFilterResult {
  filtered: Car[];
  totalCandidates: number;
  filteredOutCount: number;
}

/**
 * Applies all hard (non-negotiable) filters in sequence: budget, then
 * body type, then must-haves. These are elimination rules, not preferences —
 * a car outside budget or missing a required feature is never a "close match",
 * so it's removed before scoring rather than merely scored lower.
 */
export function applyHardFilters(cars: Car[], preferences: UserPreferences): HardFilterResult {
  const totalCandidates = cars.length;

  let filtered = filterByBudget(cars, preferences.budget);
  filtered = filterByBodyType(filtered, preferences.bodyTypes);
  filtered = filterByMustHaves(filtered, preferences.mustHaves);

  return {
    filtered,
    totalCandidates,
    filteredOutCount: totalCandidates - filtered.length,
  };
}
