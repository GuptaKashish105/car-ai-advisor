export interface ChipOption {
  value: string;
  label: string;
}

interface ChipMultiSelectProps {
  legend: string;
  options: ChipOption[];
  selected: string[];
  onToggle: (value: string) => void;
}

/**
 * Toggleable chip group for multi-select. Uses real <button aria-pressed>
 * elements rather than div/onClick — keyboard-operable and announced
 * correctly by screen readers without extra ARIA wiring. Grouped in a
 * <fieldset>/<legend> since these buttons are one logical multi-value
 * control, the same reason a checkbox group would use one.
 */
export function ChipMultiSelect({ legend, options, selected, onToggle }: ChipMultiSelectProps) {
  return (
    <fieldset className="chip-group">
      <legend>{legend}</legend>
      <div className="chip-group__options">
        {options.map((option) => {
          const isSelected = selected.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              className={isSelected ? "chip chip--selected" : "chip"}
              aria-pressed={isSelected}
              onClick={() => onToggle(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
