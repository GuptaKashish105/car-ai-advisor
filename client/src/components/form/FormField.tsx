import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}

/**
 * Label + input + inline error, in the layout every text/select field
 * shares. When `error` is set, adds a modifier class to this wrapper so
 * the invalid-state border/focus-ring in formControls.css can style
 * whatever input was passed as `children` via a CSS descendant selector —
 * no need to pass an "invalid" prop down into NumberField/SelectField.
 */
export function FormField({ label, htmlFor, error, children }: FormFieldProps) {
  return (
    <div className={error ? "form-field form-field--invalid" : "form-field"}>
      <label className="form-field__label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error && (
        <p className="form-field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
