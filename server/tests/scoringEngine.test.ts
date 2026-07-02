import { describe, expect, it } from "vitest";
import { normalize, rankCars, scoreCars, selectTopN } from "../src/services/scoringEngine.js";
import { fixtureCars, makePreferences } from "./fixtures.js";

describe("normalize", () => {
  it("maps the max of a range to 100 and the min to 0", () => {
    expect(normalize(10, { min: 0, max: 10 })).toBe(100);
    expect(normalize(0, { min: 0, max: 10 })).toBe(0);
    expect(normalize(5, { min: 0, max: 10 })).toBe(50);
  });

  it("inverts the score when invert is true", () => {
    expect(normalize(0, { min: 0, max: 10 }, true)).toBe(100);
    expect(normalize(10, { min: 0, max: 10 }, true)).toBe(0);
  });

  it("returns 100 for every value when the range has zero width, instead of dividing by zero", () => {
    expect(normalize(42, { min: 42, max: 42 })).toBe(100);
  });
});

describe("scoreCars", () => {
  it("ranks the most fuel-efficient car highest when fuel economy is the only priority", () => {
    const preferences = makePreferences({
      priorities: { price: 0, reliability: 0, fuelEconomy: 1, performance: 0, space: 0, safety: 0 },
    });

    const scored = scoreCars(fixtureCars, preferences);
    const top = rankCars(scored)[0];

    expect(top.car.id).toBe("luxury-ev-suv");
    expect(top.score).toBe(100);
  });

  it("ranks the fastest, most powerful car highest when performance is the only priority", () => {
    const preferences = makePreferences({
      priorities: { price: 0, reliability: 0, fuelEconomy: 0, performance: 1, space: 0, safety: 0 },
    });

    const scored = scoreCars(fixtureCars, preferences);
    const top = rankCars(scored)[0];

    expect(top.car.id).toBe("performance-coupe");
    expect(top.breakdown.performance).toBe(100);
  });

  it("rewards proximity to the budget midpoint, not just the lowest price", () => {
    const preferences = makePreferences({
      budget: { min: 15000, max: 80000 },
      priorities: { price: 1, reliability: 0, fuelEconomy: 0, performance: 0, space: 0, safety: 0 },
    });

    const scored = scoreCars(fixtureCars, preferences);
    const top = rankCars(scored)[0];

    // Midpoint is 47500; luxury-ev-suv (55000) is closer to it than
    // budget-sedan (20000), even though budget-sedan is far cheaper.
    expect(top.car.id).toBe("luxury-ev-suv");
  });

  it("falls back to an equal-weighted average when all priority weights are zero", () => {
    const preferences = makePreferences({
      priorities: { price: 0, reliability: 0, fuelEconomy: 0, performance: 0, space: 0, safety: 0 },
    });

    const scored = scoreCars(fixtureCars, preferences);
    expect(scored.every((s) => Number.isFinite(s.score))).toBe(true);
  });

  it("returns an empty array for an empty candidate list", () => {
    expect(scoreCars([], makePreferences())).toEqual([]);
  });
});

describe("rankCars / selectTopN", () => {
  it("sorts descending by score and slices to the requested count", () => {
    const scored = scoreCars(fixtureCars, makePreferences());
    const ranked = rankCars(scored);

    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i - 1].score).toBeGreaterThanOrEqual(ranked[i].score);
    }

    expect(selectTopN(ranked, 2)).toHaveLength(2);
  });
});
