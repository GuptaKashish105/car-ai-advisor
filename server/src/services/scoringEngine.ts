import type { Car } from "../types/car.js";
import type { Priorities, ScoringCriterion, UserPreferences } from "../types/preferences.js";
import type { ScoreBreakdown, ScoredCar } from "../types/recommendation.js";

interface Range {
  min: number;
  max: number;
}

interface AttributeRanges {
  priceDistance: Range;
  reliability: Range;
  mpg: Range;
  horsepower: Range;
  acceleration: Range;
  cargoSpace: Range;
  seating: Range;
  safety: Range;
}

/**
 * Scales a value to 0-100 relative to [min, max]. Ranges are computed from
 * the filtered candidate set (not the full dataset), so a score reflects how
 * a car compares to the other cars the buyer could actually choose between.
 * When every candidate ties on an attribute (max === min), everyone gets full
 * marks for it rather than dividing by zero — a tie shouldn't be a penalty.
 */
export function normalize(value: number, range: Range, invert = false): number {
  if (range.max === range.min) {
    return 100;
  }
  const ratio = (value - range.min) / (range.max - range.min);
  const clamped = Math.min(1, Math.max(0, ratio));
  const score = clamped * 100;
  return invert ? 100 - score : score;
}

function rangeOf(values: number[]): Range {
  return { min: Math.min(...values), max: Math.max(...values) };
}

function priceDistanceFromMidpoint(price: number, budget: UserPreferences["budget"]): number {
  const midpoint = (budget.min + budget.max) / 2;
  return Math.abs(price - midpoint);
}

function computeRanges(cars: Car[], budget: UserPreferences["budget"]): AttributeRanges {
  return {
    priceDistance: rangeOf(cars.map((car) => priceDistanceFromMidpoint(car.price, budget))),
    reliability: rangeOf(cars.map((car) => car.reliabilityScore)),
    mpg: rangeOf(cars.map((car) => car.mpg)),
    horsepower: rangeOf(cars.map((car) => car.horsepower)),
    acceleration: rangeOf(cars.map((car) => car.acceleration)),
    cargoSpace: rangeOf(cars.map((car) => car.cargoSpace)),
    seating: rangeOf(cars.map((car) => car.seating)),
    safety: rangeOf(cars.map((car) => car.safetyRating)),
  };
}

/**
 * Per-criterion breakdown, each on a 0-100 scale.
 *
 * "price" rewards proximity to the budget midpoint rather than just being
 * cheap — a $19k car against a $18-22k budget isn't a better match than a
 * $20k car, it's just cheaper.
 *
 * "performance" and "space" are each a composite of two raw attributes
 * (horsepower+acceleration, cargo+seating) because neither single number
 * captures the criterion a buyer actually cares about on its own.
 */
function computeBreakdown(car: Car, preferences: UserPreferences, ranges: AttributeRanges): ScoreBreakdown {
  const priceDistance = priceDistanceFromMidpoint(car.price, preferences.budget);

  const horsepowerScore = normalize(car.horsepower, ranges.horsepower);
  const accelerationScore = normalize(car.acceleration, ranges.acceleration, true);

  const cargoScore = normalize(car.cargoSpace, ranges.cargoSpace);
  const seatingScore = normalize(car.seating, ranges.seating);

  return {
    price: normalize(priceDistance, ranges.priceDistance, true),
    reliability: normalize(car.reliabilityScore, ranges.reliability),
    fuelEconomy: normalize(car.mpg, ranges.mpg),
    performance: (horsepowerScore + accelerationScore) / 2,
    space: (cargoScore + seatingScore) / 2,
    safety: normalize(car.safetyRating, ranges.safety),
  };
}

function roundBreakdown(breakdown: ScoreBreakdown): ScoreBreakdown {
  const entries = Object.entries(breakdown) as [ScoringCriterion, number][];
  return Object.fromEntries(entries.map(([key, value]) => [key, Math.round(value)])) as ScoreBreakdown;
}

/**
 * Weighted average of the breakdown using the buyer's stated priorities.
 * Weights are normalized by their sum, so callers can pass any positive
 * scale (e.g. 1-5 sliders) without needing them to add up to a fixed total.
 * If every weight is zero (a malformed request), falls back to an equal-
 * weight average rather than dividing by zero.
 */
function weightedScore(breakdown: ScoreBreakdown, priorities: Priorities): number {
  const criteria = Object.keys(breakdown) as ScoringCriterion[];
  const totalWeight = criteria.reduce((sum, key) => sum + (priorities[key] ?? 0), 0);

  if (totalWeight <= 0) {
    const equalWeight = 1 / criteria.length;
    return criteria.reduce((sum, key) => sum + breakdown[key] * equalWeight, 0);
  }

  return criteria.reduce((sum, key) => sum + breakdown[key] * ((priorities[key] ?? 0) / totalWeight), 0);
}

/**
 * Scores every candidate against the buyer's preferences. Ranges are derived
 * once from this exact candidate set, so scores are only meaningful relative
 * to cars scored together in the same call.
 */
export function scoreCars(cars: Car[], preferences: UserPreferences): ScoredCar[] {
  if (cars.length === 0) {
    return [];
  }

  const ranges = computeRanges(cars, preferences.budget);

  return cars.map((car) => {
    const breakdown = computeBreakdown(car, preferences, ranges);
    const roundedBreakdown = roundBreakdown(breakdown);
    return {
      car,
      score: Math.round(weightedScore(breakdown, preferences.priorities)),
      breakdown: roundedBreakdown,
      matchReasons: [],
    };
  });
}

export function rankCars(scoredCars: ScoredCar[]): ScoredCar[] {
  return [...scoredCars].sort((a, b) => b.score - a.score);
}

export function selectTopN(rankedCars: ScoredCar[], n: number): ScoredCar[] {
  return rankedCars.slice(0, n);
}
