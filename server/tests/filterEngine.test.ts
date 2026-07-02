import { describe, expect, it } from "vitest";
import { applyHardFilters, filterByBodyType, filterByBudget, filterByMustHaves } from "../src/services/filterEngine.js";
import { fixtureCars, makePreferences } from "./fixtures.js";

describe("filterByBudget", () => {
  it("excludes cars outside the budget range", () => {
    const result = filterByBudget(fixtureCars, { min: 30000, max: 60000 });
    expect(result.map((car) => car.id)).toEqual(["family-suv-awd", "luxury-ev-suv"]);
  });
});

describe("filterByBodyType", () => {
  it("returns all cars when no body types are specified", () => {
    expect(filterByBodyType(fixtureCars, undefined)).toHaveLength(fixtureCars.length);
  });

  it("keeps only cars matching one of the requested body types", () => {
    const result = filterByBodyType(fixtureCars, ["suv"]);
    expect(result.map((car) => car.id)).toEqual(["family-suv-awd", "luxury-ev-suv"]);
  });
});

describe("filterByMustHaves", () => {
  it("requires every must-have to be satisfied, not just one", () => {
    const result = filterByMustHaves(fixtureCars, ["awd", "hybrid"]);
    expect(result.map((car) => car.id)).toEqual(["family-suv-awd"]);
  });

  it("matches third-row via seating count", () => {
    const result = filterByMustHaves(fixtureCars, ["third-row"]);
    expect(result.map((car) => car.id)).toEqual(["family-suv-awd"]);
  });
});

describe("applyHardFilters", () => {
  it("combines budget, body type, and must-have filters and reports how many were dropped", () => {
    const preferences = makePreferences({
      budget: { min: 15000, max: 60000 },
      bodyTypes: ["suv"],
      mustHaves: ["awd", "hybrid"],
    });

    const result = applyHardFilters(fixtureCars, preferences);

    expect(result.totalCandidates).toBe(4);
    expect(result.filtered.map((car) => car.id)).toEqual(["family-suv-awd"]);
    expect(result.filteredOutCount).toBe(3);
  });
});
