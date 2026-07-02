import type { BodyType, Drivetrain, FuelType } from "../../types";

export const BODY_TYPE_LABELS: Record<BodyType, string> = {
  sedan: "Sedan",
  suv: "SUV",
  hatchback: "Hatchback",
  coupe: "Coupe",
  truck: "Truck",
};

export const FUEL_TYPE_LABELS: Record<FuelType, string> = {
  gas: "Gas",
  hybrid: "Hybrid",
  ev: "Electric",
};

export const DRIVETRAIN_LABELS: Record<Drivetrain, string> = {
  fwd: "FWD",
  rwd: "RWD",
  awd: "AWD",
  "4wd": "4WD",
};
