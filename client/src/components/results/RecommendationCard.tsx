import type { RecommendationResultItem } from "../../types";
import { CarImage } from "./CarImage";
import { ScoreBadge } from "./ScoreBadge";
import { MatchReasonsList } from "./MatchReasonsList";
import { CarSpecs } from "./CarSpecs";
import { BODY_TYPE_LABELS, FUEL_TYPE_LABELS } from "./specLabels";

interface RecommendationCardProps {
  result: RecommendationResultItem;
}

function SparkleIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      className="recommendation-card__explanation-icon"
    >
      <path d="M8 1.2 9.1 5l3.7 1.1L9.1 7.2 8 11l-1.1-3.8L3.2 6.1 6.9 5Z" />
      <path d="M13 9.5l.55 1.6 1.6.55-1.6.55-.55 1.6-.55-1.6-1.6-.55 1.6-.55Z" />
    </svg>
  );
}

/**
 * One shortlisted car. Purely presentational — it renders whatever
 * `RecommendationResultItem` it's given and has no idea whether that came
 * from a real API call, a mock, or a test fixture.
 */
export function RecommendationCard({ result }: RecommendationCardProps) {
  const { car, score, matchReasons, aiExplanation } = result;

  return (
    <article className="recommendation-card">
      <div className="recommendation-card__header">
        <CarImage make={car.make} model={car.model} />
        <div className="recommendation-card__title">
          <h3>
            {car.year} {car.make} {car.model}
          </h3>
          <p className="recommendation-card__subtitle">
            {BODY_TYPE_LABELS[car.bodyType]} · {FUEL_TYPE_LABELS[car.fuelType]}
          </p>
        </div>
        <ScoreBadge score={score} />
      </div>

      {/* aiExplanation is null when Gemini enrichment failed or was
          unavailable — the card degrades to match reasons + specs only,
          matching the backend's "AI is optional" design. */}
      {aiExplanation && (
        <div className="recommendation-card__explanation">
          <span className="recommendation-card__explanation-label">
            <SparkleIcon />
            AI take
          </span>
          <p className="recommendation-card__explanation-text">{aiExplanation}</p>
        </div>
      )}

      <MatchReasonsList reasons={matchReasons} />

      <CarSpecs car={car} />
    </article>
  );
}
