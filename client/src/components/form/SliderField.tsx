import type { CSSProperties } from "react";

interface SliderFieldProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

/** Labeled range slider showing its current numeric value. One reusable
 * shape covers all six priority sliders — only label/value/onChange differ. */
export function SliderField({ id, label, value, min, max, onChange }: SliderFieldProps) {
  const fillPercent = ((value - min) / (max - min)) * 100;
  // Drives the filled-track gradient in CSS (see formControls.css) — purely
  // visual, not part of the value/onChange contract this component exposes.
  const trackStyle = { "--slider-fill": `${fillPercent}%` } as CSSProperties;

  return (
    <div className="slider-field">
      <div className="slider-field__header">
        <label htmlFor={id}>{label}</label>
        <span className="slider-field__value">{value}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        style={trackStyle}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}
