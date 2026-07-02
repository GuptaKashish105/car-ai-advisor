import { GoogleGenAI, Type } from "@google/genai";
import { z } from "zod";
import type { UserPreferences } from "../types/preferences.js";
import type { ScoredCar } from "../types/recommendation.js";

const DEFAULT_MODEL = "gemini-2.5-flash";

let cachedClient: GoogleGenAI | null = null;

/**
 * Lazily constructs the client so a missing API key only fails when an
 * explanation is actually requested, not at server startup — the app
 * should boot and serve deterministic recommendations even with no key
 * configured at all.
 */
function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  if (!cachedClient) {
    cachedClient = new GoogleGenAI({ apiKey });
  }
  return cachedClient;
}

const explanationsResponseSchema = z.object({
  explanations: z.array(
    z.object({
      id: z.string(),
      explanation: z.string(),
    }),
  ),
});

/**
 * Sends only what Gemini needs to write about: the buyer's stated
 * preferences and the already-ranked shortlist with its score breakdown.
 * The prompt is explicit that ranking is final — Gemini's job is prose,
 * not re-deciding the shortlist.
 */
function buildPrompt(scoredCars: ScoredCar[], preferences: UserPreferences): string {
  const payload = {
    buyerPreferences: preferences,
    shortlist: scoredCars.map(({ car, score, breakdown, matchReasons }) => ({
      id: car.id,
      make: car.make,
      model: car.model,
      year: car.year,
      price: car.price,
      bodyType: car.bodyType,
      fuelType: car.fuelType,
      features: car.features,
      score,
      breakdown,
      matchReasons,
    })),
  };

  return [
    "You are a car-buying assistant. The shortlist below was already ranked by a deterministic scoring engine based on the buyer's stated priorities — do not re-rank, second-guess, or contradict that ranking.",
    "For each car in the shortlist, write one short, friendly paragraph (2-3 sentences) explaining why it suits this specific buyer, grounded only in the provided score breakdown, match reasons, and listed features. Do not invent specs or features that aren't listed.",
    "Buyer preferences and shortlist (JSON):",
    JSON.stringify(payload, null, 2),
  ].join("\n\n");
}

/**
 * Generates one natural-language explanation per shortlisted car. Returns a
 * Map keyed by car id so the caller can attach `aiExplanation: null` to any
 * car Gemini didn't (or couldn't) explain, without the whole call failing.
 *
 * Throws on any failure — missing key, network error, or a response that
 * doesn't match the expected shape. Callers are expected to catch this and
 * degrade gracefully; this module has no opinion on what "degrade" means.
 */
export async function generateExplanations(
  scoredCars: ScoredCar[],
  preferences: UserPreferences,
): Promise<Map<string, string>> {
  if (scoredCars.length === 0) {
    return new Map();
  }

  const ai = getClient();
  const model = process.env.GEMINI_MODEL ?? DEFAULT_MODEL;

  const response = await ai.models.generateContent({
    model,
    contents: buildPrompt(scoredCars, preferences),
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          explanations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                explanation: { type: Type.STRING },
              },
              required: ["id", "explanation"],
            },
          },
        },
        required: ["explanations"],
      },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  // Even with a response schema constraining the model, LLM output is never
  // fully trusted — parse and validate before it touches the rest of the app.
  const parsed = explanationsResponseSchema.parse(JSON.parse(text));
  return new Map(parsed.explanations.map((entry) => [entry.id, entry.explanation]));
}
