import React from "react";
import { cn } from "./cn";

/**
 * One control surface for the whole app. The visible focus treatment comes
 * from the global `:focus-visible` outline in index.css, so no control here
 * disables its own focus ring the way six of the old patterns did.
 */
export const controlBase = [
  "w-full rounded-input border border-line-2 bg-surface-2",
  "text-ui text-ink placeholder:text-ink-4",
  "transition-colors duration-150 ease-standard",
  "hover:border-line-3 focus:border-line-3",
  "disabled:cursor-not-allowed disabled:opacity-50",
].join(" ");

const heights = { sm: "h-9 px-3", md: "h-11 px-3.5", lg: "h-12 px-4" };

const withError = "border-clay/60 hover:border-clay focus:border-clay";

/** React 18's own useId, with an explicit id taking precedence. */
const useFieldId = (given) => {
  const generated = React.useId();
  return given || generated;
};

/* ------------------------------------------------------------------ Field -- */

export const Field = ({
  label,
  hint,
  error,
  required,
  htmlFor,
  className,
  children,
}) => (
  <div className={cn("flex flex-col gap-1.5", className)}>
    {label && (
      <label
        htmlFor={htmlFor}
        className="text-meta font-medium text-ink-2 select-none"
      >
        {label}
        {required && <span className="ml-1 text-clay-soft">*</span>}
      </label>
    )}
    {children}
    {error ? (
      <p className="text-micro text-clay-soft">{error}</p>
    ) : hint ? (
      <p className="text-micro text-ink-4">{hint}</p>
    ) : null}
  </div>
);

/* ------------------------------------------------------------------ Input -- */

export const Input = React.forwardRef(function Input(
  {
    label,
    hint,
    error,
    size = "md",
    leadingIcon: Leading,
    trailingSlot,
    className,
    wrapperClassName,
    id,
    required,
    ...props
  },
  ref
) {
  const fieldId = useFieldId(id);

  const control = (
    <div className="relative">
      {Leading && (
        <Leading
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-4"
          aria-hidden
        />
      )}
      <input
        ref={ref}
        id={fieldId}
        required={required}
        aria-invalid={error ? true : undefined}
        className={cn(
          controlBase,
          heights[size] || heights.md,
          Leading && "pl-10",
          trailingSlot && "pr-11",
          error && withError,
          className
        )}
        {...props}
      />
      {trailingSlot && (
        <div className="absolute top-1/2 right-2 -translate-y-1/2">
          {trailingSlot}
        </div>
      )}
    </div>
  );

  if (!label && !hint && !error) return control;

  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      required={required}
      htmlFor={fieldId}
      className={wrapperClassName}
    >
      {control}
    </Field>
  );
});

/* ----------------------------------------------------------------- Select -- */

export const Select = React.forwardRef(function Select(
  {
    label,
    hint,
    error,
    size = "md",
    className,
    wrapperClassName,
    id,
    required,
    children,
    ...props
  },
  ref
) {
  const fieldId = useFieldId(id);

  const control = (
    <div className="relative">
      <select
        ref={ref}
        id={fieldId}
        required={required}
        aria-invalid={error ? true : undefined}
        className={cn(
          controlBase,
          heights[size] || heights.md,
          "cursor-pointer appearance-none pr-10",
          error && withError,
          className
        )}
        {...props}
      >
        {children}
      </select>
      <svg
        viewBox="0 0 16 16"
        className="pointer-events-none absolute top-1/2 right-3.5 size-3.5 -translate-y-1/2 text-ink-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden
      >
        <path d="m4 6 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );

  if (!label && !hint && !error) return control;

  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      required={required}
      htmlFor={fieldId}
      className={wrapperClassName}
    >
      {control}
    </Field>
  );
});

/* --------------------------------------------------------------- Textarea -- */

export const Textarea = React.forwardRef(function Textarea(
  {
    label,
    hint,
    error,
    rows = 4,
    className,
    wrapperClassName,
    id,
    required,
    ...props
  },
  ref
) {
  const fieldId = useFieldId(id);

  const control = (
    <textarea
      ref={ref}
      id={fieldId}
      rows={rows}
      required={required}
      aria-invalid={error ? true : undefined}
      className={cn(
        controlBase,
        "resize-y px-3.5 py-2.5 leading-relaxed",
        error && withError,
        className
      )}
      {...props}
    />
  );

  if (!label && !hint && !error) return control;

  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      required={required}
      htmlFor={fieldId}
      className={wrapperClassName}
    >
      {control}
    </Field>
  );
});

/* ----------------------------------------------------------------- Switch -- */

/** Replaces the ~400-character hand-rolled peer/after: toggle in the admin area. */
export const Switch = React.forwardRef(function Switch(
  { checked = false, onChange, label, description, disabled, className, id, ...props },
  ref
) {
  const fieldId = useFieldId(id);

  return (
    <div className={cn("flex items-start gap-3", className)}>
      <button
        ref={ref}
        id={fieldId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={cn(
          "relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full border",
          "transition-colors duration-150 ease-standard",
          "disabled:cursor-not-allowed disabled:opacity-45",
          checked
            ? "border-accent/40 bg-accent/80"
            : "border-line-2 bg-surface-3"
        )}
        {...props}
      >
        <span
          className={cn(
            "size-3.5 rounded-full transition-transform duration-150 ease-standard",
            checked ? "translate-x-[18px] bg-canvas" : "translate-x-[3px] bg-ink-3"
          )}
        />
      </button>
      {(label || description) && (
        <div className="flex flex-col gap-0.5">
          {label && (
            <label
              htmlFor={fieldId}
              className="cursor-pointer text-ui font-medium text-ink select-none"
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-micro text-ink-4">{description}</p>
          )}
        </div>
      )}
    </div>
  );
});

/* -------------------------------------------------------------- Checkbox --- */

export const Checkbox = React.forwardRef(function Checkbox(
  { label, className, id, ...props },
  ref
) {
  const fieldId = useFieldId(id);

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {/* Native rendering plus accent-color: the check mark and the
          indeterminate state come for free, and it stays accessible. */}
      <input
        ref={ref}
        id={fieldId}
        type="checkbox"
        className={cn(
          "size-4 shrink-0 cursor-pointer rounded-[4px] accent-accent",
          "disabled:cursor-not-allowed disabled:opacity-45"
        )}
        {...props}
      />
      {label && (
        <label
          htmlFor={fieldId}
          className="cursor-pointer text-ui text-ink-2 select-none"
        >
          {label}
        </label>
      )}
    </div>
  );
});

export default Field;
