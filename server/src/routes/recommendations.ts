import { Router, type Request, type Response } from "express";
import { loadCars } from "../data/loadCars.js";
import { recommendationRequestSchema } from "../schemas/recommendationRequest.js";
import { generateExplanations } from "../services/geminiService.js";
import { getRecommendations } from "../services/recommendationEngine.js";
import type { ScoredCar } from "../types/recommendation.js";

export const recommendationsRouter = Router();

// Static dataset — loaded once at module init, not per request.
const cars = loadCars();

interface RecommendationApiResult extends ScoredCar {
  aiExplanation: string | null;
}

recommendationsRouter.post("/recommendations", async (req: Request, res: Response) => {
  const parseResult = recommendationRequestSchema.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({
      error: "Invalid request body",
      details: parseResult.error.flatten(),
    });
    return;
  }

  const preferences = parseResult.data;

  // Deterministic and synchronous — this is the actual recommendation
  // decision. It never touches Gemini, so it can't fail because an AI
  // provider is down.
  const { results, meta } = getRecommendations(cars, preferences);

  // AI enrichment happens only after the shortlist is final, and only
  // affects presentation (an extra paragraph per car) — never the ranking
  // itself. A failure here is expected and handled, not exceptional: log it
  // and ship the deterministic results with `aiExplanation: null` rather
  // than failing the whole request.
  let explanations = new Map<string, string>();
  try {
    explanations = await generateExplanations(results, preferences);
  } catch (error) {
    console.error("Gemini explanation generation failed; returning recommendations without it:", error);
  }

  const enrichedResults: RecommendationApiResult[] = results.map((scoredCar) => ({
    ...scoredCar,
    aiExplanation: explanations.get(scoredCar.car.id) ?? null,
  }));

  res.status(200).json({ results: enrichedResults, meta });
});
