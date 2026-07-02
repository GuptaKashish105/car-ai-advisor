export interface PreferenceFormErrors {
  budgetMin?: string;
  budgetMax?: string;
}

/**
 * Client-side mirror of the server's budget validation (see
 * server/src/schemas/recommendationRequest.ts) — same rules, so a user
 * finds out about a bad budget immediately instead of after a round trip.
 * The server remains the source of truth and re-validates independently;
 * this only exists for fast feedback.
 */
export function validateBudget(budgetMin: string, budgetMax: string): PreferenceFormErrors {
  const errors: PreferenceFormErrors = {};
  const min = Number(budgetMin);
  const max = Number(budgetMax);

  if (budgetMin.trim() === "" || Number.isNaN(min)) {
    errors.budgetMin = "Enter a minimum budget";
  } else if (min < 0) {
    errors.budgetMin = "Minimum budget can't be negative";
  }

  if (budgetMax.trim() === "" || Number.isNaN(max)) {
    errors.budgetMax = "Enter a maximum budget";
  } else if (max <= 0) {
    errors.budgetMax = "Maximum budget must be greater than zero";
  }

  if (!errors.budgetMin && !errors.budgetMax && max < min) {
    errors.budgetMax = "Maximum budget must be at least the minimum budget";
  }

  return errors;
}

export function hasErrors(errors: PreferenceFormErrors): boolean {
  return Object.values(errors).some((message) => message !== undefined);
}
