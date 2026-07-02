import { describe, expect, it } from "vitest";
import { loadCars } from "../src/data/loadCars.js";
import { getRecommendations } from "../src/services/recommendationEngine.js";
import { fixtureCars, makePreferences } from "./fixtures.js";

describe("getRecommendations (fixture data)", () => {
  it("returns at most topN results, each with a score, breakdown, and match reasons", () => {
    const result = getRecommendations(fixtureCars, makePreferences(), 3);

    expect(result.results.length).toBeLessThanOrEqual(3);
    expect(result.meta.totalCandidates).toBe(fixtureCars.length);

    for (const scored of result.results) {
      expect(scored.score).toBeGreaterThanOrEqual(0);
      expect(scored.score).toBeLessThanOrEqual(100);
      expect(scored.matchReasons.length).toBeGreaterThan(0);
    }
  });

  it("reports every candidate as filtered out when the budget matches nothing", () => {
    const preferences = makePreferences({ budget: { min: 1, max: 100 } });
    const result = getRecommendations(fixtureCars, preferences, 3);

    expect(result.results).toEqual([]);
    expect(result.meta.filteredOutCount).toBe(fixtureCars.length);
  });
});

describe("getRecommendations (real dataset)", () => {
  const cars = loadCars();

  it("loads the full curated dataset", () => {
    expect(cars.length).toBeGreaterThanOrEqual(25);
  });

  it("produces a sensible top 3 for a budget-conscious commuter", () => {
    const preferences = makePreferences({
      budget: { min: 18000, max: 26000 },
      priorities: { price: 4, reliability: 4, fuelEconomy: 3, performance: 1, space: 1, safety: 2 },
    });

    const result = getRecommendations(cars, preferences, 3);

    expect(result.results).toHaveLength(3);
    for (const { car } of result.results) {
      expect(car.price).toBeGreaterThanOrEqual(preferences.budget.min);
      expect(car.price).toBeLessThanOrEqual(preferences.budget.max);
    }
  });

  it("respects must-haves end to end for a family third-row AWD buyer", () => {
    const preferences = makePreferences({
      budget: { min: 30000, max: 50000 },
      mustHaves: ["third-row", "awd"],
      priorities: { price: 2, reliability: 3, fuelEconomy: 1, performance: 1, space: 4, safety: 3 },
    });

    const result = getRecommendations(cars, preferences, 3);

    expect(result.results.length).toBeGreaterThan(0);
    for (const { car } of result.results) {
      expect(car.seating).toBeGreaterThanOrEqual(7);
      expect(["awd", "4wd"]).toContain(car.drivetrain);
    }
  });
});
