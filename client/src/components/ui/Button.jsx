import React from "react";
import { cn } from "./cn";
import Spinner from "./Spinner";

/**
 * design.md records the primary action as a light face (#E5E5E5) with black
 * text at a pill radius, and the secondary one step darker (#D6D6D6). Those
 * are the `primary` and `secondary` variants here. Everything else is built
 * from hairlines and the ink ramp, so the accent stays scarce.
 */
const variants = {
  primary: "bg-btn text-canvas hover:bg-btn-hover active:bg-btn-2",
  secondary: "bg-btn-2 text-canvas hover:bg-btn-2-hover active:bg-btn-2",
  outline:
    "border border-line-2 text-ink hover:border-line-3 hover:bg-surface-2 active:bg-surface-3",
  subtle:
    "border border-line bg-surface-2 text-ink hover:bg-surface-3 hover:border-line-2",
  ghost: "text-ink-2 hover:text-ink hover:bg-surface-2",
  danger: "bg-clay text-ink hover:bg-clay-soft active:bg-clay",
  link: "text-ink underline decoration-line-3 decoration-1 underline-offset-4 hover:decoration-accent",
};

const sizes = {
  sm: "h-8 gap-1.5 px-3.5 text-meta",
  md: "h-10 gap-2 px-5 text-ui",
  lg: "h-12 gap-2 px-6 text-ui",
};

const Button = React.forwardRef(function Button(
  {
    as: Component = "button",
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    fullWidth = false,
    leadingIcon: Leading,
    trailingIcon: Trailing,
    className,
    children,
    type,
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading;

  return (
    <Component
      ref={ref}
      type={Component === "button" ? type || "button" : type}
      disabled={Component === "button" ? isDisabled : undefined}
      aria-disabled={isDisabled || undefined}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-medium whitespace-nowrap",
        "transition-colors duration-150 ease-standard",
        "disabled:cursor-not-allowed disabled:opacity-45",
        "aria-disabled:cursor-not-allowed aria-disabled:opacity-45",
        variants[variant] || variants.primary,
        variant === "link" ? "gap-1.5 text-ui" : sizes[size] || sizes.md,
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {loading ? (
        <Spinner size={size === "lg" ? "md" : "sm"} />
      ) : (
        Leading && <Leading className="size-4 shrink-0" aria-hidden />
      )}
      {children}
      {Trailing && !loading && (
        <Trailing className="size-4 shrink-0" aria-hidden />
      )}
    </Component>
  );
});

export default Button;
