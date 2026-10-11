import React from "react";
import { cn } from "./cn";
import Spinner from "./Spinner";

const variants = {
  ghost: "text-ink-3 hover:text-ink hover:bg-surface-2",
  subtle:
    "border border-line bg-surface-2 text-ink-2 hover:text-ink hover:bg-surface-3",
  outline: "border border-line-2 text-ink-2 hover:text-ink hover:border-line-3",
  danger: "text-ink-3 hover:text-clay-soft hover:bg-clay-faint",
  solid: "bg-btn text-canvas hover:bg-btn-hover",
};

const sizes = { sm: "size-7", md: "size-9", lg: "size-10" };
const iconSizes = { sm: "size-3.5", md: "size-4", lg: "size-[18px]" };

const IconButton = React.forwardRef(function IconButton(
  {
    as: Component = "button",
    icon: Icon,
    label,
    variant = "ghost",
    size = "md",
    loading = false,
    disabled = false,
    className,
    type,
    children,
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
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full",
        "cursor-pointer transition-all duration-150 ease-standard",
        "hover:scale-105 active:scale-95 disabled:transform-none",
        "disabled:cursor-not-allowed disabled:opacity-45",
        variants[variant] || variants.ghost,
        sizes[size] || sizes.md,
        className
      )}
      {...props}
    >
      {loading ? (
        <Spinner size="xs" />
      ) : Icon ? (
        <Icon className={iconSizes[size] || iconSizes.md} aria-hidden />
      ) : (
        children
      )}
    </Component>
  );
});

export default IconButton;
