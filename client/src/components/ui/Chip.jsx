import React from "react";
import { cn } from "./cn";

/**
 * Selectable filter chip. Replaces the five hand-written category pills in the
 * marketplace and the radio-disguised-as-chip labels in skill exchange.
 */
const Chip = React.forwardRef(function Chip(
  { active = false, icon: Icon, count, className, children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-pressed={active}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-2 rounded-chip border px-3.5",
        "text-meta font-medium whitespace-nowrap",
        "cursor-pointer transition-all duration-150 ease-standard",
        "hover:-translate-y-px active:translate-y-0",
        active
          ? "border-accent/30 bg-accent-faint text-accent-dim"
          : "border-line bg-surface-2 text-ink-2 hover:border-line-2 hover:text-ink",
        className
      )}
      {...props}
    >
      {Icon && <Icon className="size-3.5 shrink-0" aria-hidden />}
      {children}
      {count != null && <span className="numeric text-ink-4">{count}</span>}
    </button>
  );
});

export default Chip;
