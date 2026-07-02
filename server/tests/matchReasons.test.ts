import { describe, expect, it } from "vitest";
import { generateMatchReasons } from "../src/services/matchReasons.js";
import type { ScoredCar } from "../src/types/recommendation.js";
import { fixtureCars, makePreferences } from "./fixtures.js";

function scoredCarWith(breakdown: ScoredCar["breakdown"]): ScoredCar {
  return {
    car: fixtureCars.find((car) => car.id === "family-suv-awd")!,
    score: 0,
    breakdown,
    matchReasons: [],
  };
}

describe("generateMatchReasons", () => {
  it("always surfaces must-have matches", () => {
    const scoredCar = scoredCarWith({ price: 0, reliability: 0, fuelEconomy: 0, performance: 0, space: 0, safety: 0 });
    const preferences = makePreferences({ mustHaves: ["awd", "hybrid"] });

    const reasons = generateMatchReasons(scoredCar, preferences);

    expect(reasons).toContain("Comes with the AWD/4WD you required");
    expect(reasons).toContain("Hybrid powertrain, as required");
  });

  it("orders strength reasons by weight x score, most important to the buyer first", () => {
    const scoredCar = scoredCarWith({ price: 0, reliability: 80, fuelEconomy: 90, performance: 0, space: 0, safety: 0 });
    const preferences = makePreferences({
      priorities: { price: 0, reliability: 1, fuelEconomy: 5, performance: 0, space: 0, safety: 0 },
    });

    const reasons = generateMatchReasons(scoredCar, preferences);

    expect(reasons[0]).toBe("Excellent fuel economy for its class");
    expect(reasons).toContain("Above-average reliability for its class");
  });

  it("falls back to a generic reason when nothing clears the strength threshold", () => {
    const scoredCar = scoredCarWith({ price: 40, reliability: 40, fuelEconomy: 40, performance: 40, space: 40, safety: 40 });
    const preferences = makePreferences();

    expect(generateMatchReasons(scoredCar, preferences)).toEqual([
      "A well-rounded option that balances your stated priorities",
    ]);
  });

  it("caps the number of reasons returned", () => {
    const scoredCar = scoredCarWith({ price: 90, reliability: 90, fuelEconomy: 90, performance: 90, space: 90, safety: 90 });
    const preferences = makePreferences();

    expect(generateMatchReasons(scoredCar, preferences, 3)).toHaveLength(3);
  });
});
