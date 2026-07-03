import { postJson } from "./client";
import type { RecommendationResponse, UserPreferences } from "../types";

export function getRecommendations(preferences: UserPreferences): Promise<RecommendationResponse> {
  return postJson<RecommendationResponse, UserPreferences>("/api/recommendations", preferences);
}
