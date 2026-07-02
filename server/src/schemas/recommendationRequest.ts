import { z } from "zod";

const bodyTypeSchema = z.enum(["sedan", "suv", "hatchback", "coupe", "truck"]);
const mustHaveSchema = z.enum(["awd", "hybrid", "ev", "third-row", "manual"]);
const primaryUseSchema = z.enum(["commute", "family", "offroad", "first-car", "towing"]);

const budgetSchema = z
  .object({
    min: z.number().nonnegative(),
    max: z.number().positive(),
  })
  .refine((budget) => budget.max >= budget.min, {
    message: "budget.max must be greater than or equal to budget.min",
    path: ["max"],
  });

const prioritiesSchema = z.object({
  price: z.number().min(0),
  reliability: z.number().min(0),
  fuelEconomy: z.number().min(0),
  performance: z.number().min(0),
  space: z.number().min(0),
  safety: z.number().min(0),
});

/**
 * Mirrors the shape of `UserPreferences` (src/types/preferences.ts). Kept as
 * a separate schema, rather than generating types from it, so the domain
 * model isn't coupled to the validation library — the route layer is
 * responsible for making sure the two stay in sync.
 */
export const recommendationRequestSchema = z.object({
  budget: budgetSchema,
  primaryUse: primaryUseSchema.optional(),
  bodyTypes: z.array(bodyTypeSchema).min(1).optional(),
  mustHaves: z.array(mustHaveSchema).min(1).optional(),
  priorities: prioritiesSchema,
});

export type RecommendationRequestBody = z.infer<typeof recommendationRequestSchema>;
