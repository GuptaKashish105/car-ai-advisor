import type { SelectOption } from "../form/SelectField";
import type { ChipOption } from "../form/ChipMultiSelect";
import type { ScoringCriterion } from "../../types";

export const PRIMARY_USE_OPTIONS: SelectOption[] = [
  { value: "commute", label: "Daily commuting" },
  { value: "family", label: "Family / kids" },
  { value: "offroad", label: "Off-road / outdoors" },
  { value: "first-car", label: "First car" },
  { value: "towing", label: "Towing / hauling" },
];

export const BODY_TYPE_OPTIONS: SelectOption[] = [
  { value: "sedan", label: "Sedan" },
  { value: "suv", label: "SUV" },
  { value: "hatchback", label: "Hatchback" },
  { value: "coupe", label: "Coupe" },
  { value: "truck", label: "Truck" },
];

export const MUST_HAVE_OPTIONS: ChipOption[] = [
  { value: "awd", label: "AWD / 4WD" },
  { value: "hybrid", label: "Hybrid" },
  { value: "ev", label: "Electric (EV)" },
  { value: "third-row", label: "Third-row seating" },
  { value: "manual", label: "Manual transmission" },
];

interface PriorityCriterionOption {
  key: ScoringCriterion;
  label: string;
}

export const PRIORITY_CRITERIA: PriorityCriterionOption[] = [
  { key: "price", label: "Price" },
  { key: "reliability", label: "Reliability" },
  { key: "fuelEconomy", label: "Fuel Economy" },
  { key: "performance", label: "Performance" },
  { key: "space", label: "Space" },
  { key: "safety", label: "Safety" },
];

export const PRIORITY_MIN = 1;
export const PRIORITY_MAX = 5;
export const PRIORITY_DEFAULT = 3;
