export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder: string;
}

/**
 * Generic single-select dropdown with a leading placeholder option that
 * represents "no filter" (empty string value). Deliberately deals only in
 * strings — callers own casting the selected value to their specific union
 * type, so this component has no knowledge of PrimaryUse, BodyType, etc.
 */
export function SelectField({ id, value, onChange, options, placeholder }: SelectFieldProps) {
  return (
    <select id={id} className="select-input" value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
