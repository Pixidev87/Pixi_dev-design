import { useId } from "react";

export function Field({ label, error, hint, multiline = false, ...props }) {
  const id = useId();
  const Input = multiline ? "textarea" : "input";
  const message = Array.isArray(error)
    ? error.filter((item) => typeof item === "string").join(" ")
    : error;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {hint && (
        <span className="field-hint" id={`${id}-hint`}>
          {hint}
        </span>
      )}
      <Input
        id={id}
        {...props}
        aria-invalid={message ? true : undefined}
        aria-describedby={
          [hint && `${id}-hint`, message && `${id}-error`]
            .filter(Boolean)
            .join(" ") || undefined
        }
      />
      {message && (
        <span className="field-error" id={`${id}-error`}>
          {message}
        </span>
      )}
    </div>
  );
}
export function Feedback({ error, children, success = false }) {
  if (!error && !children) return null;
  return (
    <div
      className={`feedback ${success ? "success" : ""}`}
      role={success ? "status" : "alert"}
    >
      {error?.message || children}
    </div>
  );
}
