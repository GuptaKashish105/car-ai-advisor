import type { Car } from "../../types";
import { formatCurrency } from "../../utils/formatters";
import { DRIVETRAIN_LABELS } from "./specLabels";

interface CarSpecsProps {
  car: Car;
}

interface SpecItem {
  label: string;
  value: string;
}

/**
 * A curated subset of `Car`'s fields, not every field — a shortlist card
 * needs the handful of specs a buyer actually scans, not a full spec sheet.
 */
function toSpecItems(car: Car): SpecItem[] {
  return [
    { label: "Price", value: formatCurrency(car.price) },
    { label: car.fuelType === "ev" ? "MPGe" : "MPG", value: `${car.mpg}` },
    { label: "Horsepower", value: `${car.horsepower} hp` },
    { label: "Seating", value: `${car.seating}` },
    { label: "Safety Rating", value: `${car.safetyRating}/5` },
    { label: "Drivetrain", value: DRIVETRAIN_LABELS[car.drivetrain] },
  ];
}

/** Reusable label/value spec grid — takes a full Car, not car-specific markup callers assemble themselves. */
export function CarSpecs({ car }: CarSpecsProps) {
  return (
    <dl className="car-specs">
      {toSpecItems(car).map((item) => (
        <div className="car-specs__item" key={item.label}>
          <dt className="car-specs__label">{item.label}</dt>
          <dd className="car-specs__value">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
