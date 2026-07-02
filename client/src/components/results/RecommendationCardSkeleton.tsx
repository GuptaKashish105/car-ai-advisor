/**
 * Decorative placeholder shown while a recommendation request is in
 * flight, shaped like a real RecommendationCard so the grid doesn't jump
 * when results arrive. Marked aria-hidden — the section rendering it
 * supplies the actual loading announcement for assistive tech separately.
 */
export function RecommendationCardSkeleton() {
  return (
    <div className="recommendation-card recommendation-card--skeleton" aria-hidden="true">
      <div className="recommendation-card__header">
        <div className="skeleton skeleton--circle" />
        <div className="recommendation-card__title--skeleton">
          <div className="skeleton skeleton--line" style={{ width: "75%" }} />
          <div className="skeleton skeleton--line" style={{ width: "45%" }} />
        </div>
        <div className="skeleton skeleton--circle" />
      </div>
      <div className="skeleton skeleton--block" />
      <div className="skeleton skeleton--line" style={{ width: "90%" }} />
      <div className="skeleton skeleton--line" style={{ width: "65%" }} />
    </div>
  );
}
