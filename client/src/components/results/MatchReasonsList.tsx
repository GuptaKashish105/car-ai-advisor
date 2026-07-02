interface MatchReasonsListProps {
  reasons: string[];
}

/** Small check-in-circle mark, rendered per item so its alignment is
 * controlled by flexbox rather than a CSS pseudo-element positioned
 * relative to text — keeps it visually centered regardless of font/line-height. */
function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="match-reasons__icon">
      <circle cx="10" cy="10" r="10" fill="currentColor" opacity="0.15" />
      <path
        d="M6 10.2 8.6 12.8 14 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Reusable bullet list for any list of short reason strings. */
export function MatchReasonsList({ reasons }: MatchReasonsListProps) {
  if (reasons.length === 0) {
    return null;
  }

  return (
    <ul className="match-reasons">
      {reasons.map((reason) => (
        <li key={reason} className="match-reasons__item">
          <CheckIcon />
          <span>{reason}</span>
        </li>
      ))}
    </ul>
  );
}
