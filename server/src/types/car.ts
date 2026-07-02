export type BodyType = "sedan" | "suv" | "hatchback" | "coupe" | "truck";
export type FuelType = "gas" | "hybrid" | "ev";
export type Drivetrain = "fwd" | "rwd" | "awd" | "4wd";
export type Transmission = "automatic" | "cvt" | "manual" | "single-speed";

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
  /** Combined MPG for gas/hybrid, MPGe for EVs. */
  mpg: number;
  horsepower: number;
  /** 0-100 composite reliability index. */
  reliabilityScore: number;
  /** Overall safety rating, 1-5 stars (half-star increments allowed). */
  safetyRating: number;
  /** Cubic feet. */
  cargoSpace: number;
  seating: number;
  /** 0-60 mph, in seconds. Lower is faster. */
  acceleration: number;
  features: string[];
  tags: string[];
}
