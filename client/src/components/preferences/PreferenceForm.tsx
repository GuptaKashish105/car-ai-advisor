import { useId, useState } from "react";
import type { FormEvent } from "react";
import type { BodyType, MustHave, PrimaryUse, Priorities, ScoringCriterion, UserPreferences } from "../../types";
import { FormField } from "../form/FormField";
import { NumberField } from "../form/NumberField";
import { SelectField } from "../form/SelectField";
import { ChipMultiSelect } from "../form/ChipMultiSelect";
import { SliderField } from "../form/SliderField";
import {
  BODY_TYPE_OPTIONS,
  MUST_HAVE_OPTIONS,
  PRIMARY_USE_OPTIONS,
  PRIORITY_CRITERIA,
  PRIORITY_DEFAULT,
  PRIORITY_MAX,
  PRIORITY_MIN,
} from "./constants";
import { hasErrors, validateBudget, type PreferenceFormErrors } from "./validation";
import "../form/formControls.css";
import "./PreferenceForm.css";

/**
 * Local UI shape, distinct from the `UserPreferences` API contract: budget
 * fields stay as strings (see NumberField), and body type is a single value
 * because the requested UI is one dropdown, not a multi-select. It's
 * widened into the array-based API shape only at submit time, in
 * `toUserPreferences`.
 */
interface PreferenceFormValues {
  budgetMin: string;
  budgetMax: string;
  primaryUse: PrimaryUse | "";
  bodyType: BodyType | "";
  mustHaves: MustHave[];
  priorities: Priorities;
}

const INITIAL_VALUES: PreferenceFormValues = {
  budgetMin: "",
  budgetMax: "",
  primaryUse: "",
  bodyType: "",
  mustHaves: [],
  priorities: {
    price: PRIORITY_DEFAULT,
    reliability: PRIORITY_DEFAULT,
    fuelEconomy: PRIORITY_DEFAULT,
    performance: PRIORITY_DEFAULT,
    space: PRIORITY_DEFAULT,
    safety: PRIORITY_DEFAULT,
  },
};

function toUserPreferences(values: PreferenceFormValues): UserPreferences {
  return {
    budget: { min: Number(values.budgetMin), max: Number(values.budgetMax) },
    ...(values.primaryUse && { primaryUse: values.primaryUse }),
    ...(values.bodyType && { bodyTypes: [values.bodyType] }),
    ...(values.mustHaves.length > 0 && { mustHaves: values.mustHaves }),
    priorities: values.priorities,
  };
}

interface PreferenceFormProps {
  /** Called with a fully-formed, valid UserPreferences object. This
   * component has no idea what happens next (API call, results view) —
   * that's the caller's responsibility. */
  onSubmit: (preferences: UserPreferences) => void;
}

export function PreferenceForm({ onSubmit }: PreferenceFormProps) {
  const formId = useId();
  const [values, setValues] = useState<PreferenceFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<PreferenceFormErrors>({});

  function updatePriority(key: ScoringCriterion, value: number) {
    setValues((prev) => ({ ...prev, priorities: { ...prev.priorities, [key]: value } }));
  }

  function toggleMustHave(value: string) {
    const mustHave = value as MustHave;
    setValues((prev) => ({
      ...prev,
      mustHaves: prev.mustHaves.includes(mustHave)
        ? prev.mustHaves.filter((item) => item !== mustHave)
        : [...prev.mustHaves, mustHave],
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const budgetErrors = validateBudget(values.budgetMin, values.budgetMax);
    setErrors(budgetErrors);

    if (hasErrors(budgetErrors)) {
      return;
    }

    onSubmit(toUserPreferences(values));
  }

  return (
    <form className="preference-form" onSubmit={handleSubmit} noValidate>
      <fieldset className="preference-form__section">
        <legend>Budget</legend>
        <div className="preference-form__grid preference-form__grid--two">
          <FormField label="Minimum ($)" htmlFor={`${formId}-budget-min`} error={errors.budgetMin}>
            <NumberField
              id={`${formId}-budget-min`}
              value={values.budgetMin}
              min={0}
              placeholder="e.g. 20000"
              onChange={(value) => setValues((prev) => ({ ...prev, budgetMin: value }))}
            />
          </FormField>
          <FormField label="Maximum ($)" htmlFor={`${formId}-budget-max`} error={errors.budgetMax}>
            <NumberField
              id={`${formId}-budget-max`}
              value={values.budgetMax}
              min={0}
              placeholder="e.g. 35000"
              onChange={(value) => setValues((prev) => ({ ...prev, budgetMax: value }))}
            />
          </FormField>
        </div>
      </fieldset>

      <fieldset className="preference-form__section">
        <legend>How will you use it?</legend>
        <div className="preference-form__grid preference-form__grid--two">
          <FormField label="Primary use" htmlFor={`${formId}-primary-use`}>
            <SelectField
              id={`${formId}-primary-use`}
              value={values.primaryUse}
              options={PRIMARY_USE_OPTIONS}
              placeholder="No preference"
              onChange={(value) => setValues((prev) => ({ ...prev, primaryUse: value as PrimaryUse | "" }))}
            />
          </FormField>
          <FormField label="Body type" htmlFor={`${formId}-body-type`}>
            <SelectField
              id={`${formId}-body-type`}
              value={values.bodyType}
              options={BODY_TYPE_OPTIONS}
              placeholder="Any body type"
              onChange={(value) => setValues((prev) => ({ ...prev, bodyType: value as BodyType | "" }))}
            />
          </FormField>
        </div>
      </fieldset>

      <ChipMultiSelect
        legend="Must-haves"
        options={MUST_HAVE_OPTIONS}
        selected={values.mustHaves}
        onToggle={toggleMustHave}
      />

      <fieldset className="preference-form__section">
        <legend>What matters most to you?</legend>
        <div className="preference-form__sliders">
          {PRIORITY_CRITERIA.map((criterion) => (
            <SliderField
              key={criterion.key}
              id={`${formId}-priority-${criterion.key}`}
              label={criterion.label}
              min={PRIORITY_MIN}
              max={PRIORITY_MAX}
              value={values.priorities[criterion.key]}
              onChange={(value) => updatePriority(criterion.key, value)}
            />
          ))}
        </div>
      </fieldset>

      <button type="submit" className="preference-form__submit">
        Find my shortlist
      </button>
    </form>
  );
}
