export type BodyType = "sedan" | "suv" | "hatchback" | "coupe" | "truck";
export type FuelType = "gas" | "hybrid" | "ev";
export type Drivetrain = "fwd" | "rwd" | "awd" | "4wd";
export type Transmission = "automatic" | "cvt" | "manual" | "single-speed";

/**
 * Mirrors server/src/types/car.ts. Duplicated rather than shared across a
 * monorepo package, since the two workspaces build and run independently —
 * keeping the request/response contract manually in sync here is simpler
 * than adding shared-package tooling for a project this size.
 */
export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  bodyType: BodyType;
  fuelType: FuelType;
  drivetrain: Drivetrain;
  transmission: Transmission;
  mpg: number;
  horsepower: number;
  reliabilityScore: number;
  safetyRating: number;
  cargoSpace: number;
  seating: number;
  acceleration: number;
  features: string[];
  tags: string[];
}
