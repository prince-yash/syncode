import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Field({ label, error, id, ...props }: FieldProps) {
  const fieldId = id ?? props.name;
  return (
    <div className="field">
      <label className="field__label" htmlFor={fieldId}>
        {label}
      </label>
      <input
        className={`field__input${error ? " field__input--error" : ""}`}
        id={fieldId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        {...props}
      />
      {error && (
        <span className="field__error" id={`${fieldId}-error`} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

interface TextareaFieldProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
}

export function TextareaField({
  label,
  hint,
  id,
  ...props
}: TextareaFieldProps) {
  const fieldId = id ?? props.name;
  return (
    <div className="field">
      <label className="field__label" htmlFor={fieldId}>
        {label}
      </label>
      <textarea
        className="field__input field__textarea"
        id={fieldId}
        {...props}
      />
      {hint && <span className="field__hint">{hint}</span>}
    </div>
  );
}
