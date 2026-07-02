interface NumberFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  min?: number;
}

/**
 * Controlled numeric input that keeps its value as a string. Storing "" or
 * a partially-typed number ("2", "20,") as a string sidesteps the classic
 * controlled-number-input problem where an empty or invalid field forces an
 * awkward fallback to 0 or NaN — parsing happens once, at validation time.
 */
export function NumberField({ id, value, onChange, placeholder, min }: NumberFieldProps) {
  return (
    <input
      id={id}
      className="text-input"
      type="number"
      inputMode="numeric"
      value={value}
      min={min}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
