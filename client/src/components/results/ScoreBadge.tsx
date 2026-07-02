import type { CSSProperties } from "react";

interface ScoreBadgeProps {
  score: number;
}

/**
 * Reusable 0-100 match score badge — still just renders the number it's
 * given (the calculation happens entirely server-side, in the scoring
 * engine). The progress-ring fill is a purely visual read of that same
 * number via a CSS custom property, not a second calculation of it.
 */
export function ScoreBadge({ score }: ScoreBadgeProps) {
  const ringStyle = { "--score-percent": `${score}%` } as CSSProperties;

  return (
    <div className="score-badge" style={ringStyle} aria-label={`Match score: ${score} out of 100`}>
      <div className="score-badge__ring">
        <span className="score-badge__value">{score}</span>
        <span className="score-badge__max">/ 100</span>
      </div>
    </div>
  );
}
