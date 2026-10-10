import React from "react";
import { cn } from "./cn";

const surfaces = {
  default: "bg-surface border border-line",
  raised: "bg-surface-2 border border-line-2",
  flat: "bg-transparent border border-line",
  inset: "bg-canvas border border-line",
};

const paddings = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6 md:p-7",
};

/**
 * One card recipe for the whole app: flat surface, 1px hairline, 12px radius
 * (tokens.md), no drop shadow. `interactive` shifts the hairline on hover
 * rather than scaling the card.
 */
const Card = React.forwardRef(function Card(
  {
    as: Component = "div",
    surface = "default",
    padding = "md",
    interactive = false,
    className,
    children,
    ...props
  },
  ref
) {
  return (
    <Component
      ref={ref}
      className={cn(
        "rounded-card",
        surfaces[surface] || surfaces.default,
        paddings[padding] ?? paddings.md,
        interactive &&
          "transition-colors duration-150 ease-standard hover:border-line-3 hover:bg-surface-2",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
});

export default Card;
