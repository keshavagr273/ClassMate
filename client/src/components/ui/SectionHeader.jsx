import React from "react";
import { cn } from "./cn";

/**
 * Each tool owns a hue. Tailwind cannot build class names from interpolated
 * strings, so these are a static lookup rather than `text-${tone}`.
 */
const tones = {
  default: "text-ink-4",
  skill: "text-skill",
  jobs: "text-jobs",
  pulse: "text-pulse",
  bazaar: "text-bazaar",
  found: "text-found",
  ride: "text-ride",
  accent: "text-accent-dim",
};

const rules = {
  default: "bg-line-3",
  skill: "bg-skill",
  jobs: "bg-jobs",
  pulse: "bg-pulse",
  bazaar: "bg-bazaar",
  found: "bg-found",
  ride: "bg-ride",
  accent: "bg-accent",
};

/** Uppercase micro-label. Sets the section's register before the heading does. */
export const Eyebrow = ({ tone = "default", className, children, ...props }) => (
  <p
    className={cn("text-eyebrow uppercase", tones[tone] || tones.default, className)}
    {...props}
  >
    {children}
  </p>
);

/**
 * Left-aligned section head with an optional trailing action. Deliberately not
 * centered — centering every heading is most of what makes a page read as
 * generated.
 */
const SectionHeader = ({
  eyebrow,
  title,
  description,
  action,
  tone = "default",
  rule = false,
  as: Heading = "h2",
  size = "h3",
  className,
  ...props
}) => (
  <div
    className={cn(
      "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
      className
    )}
    {...props}
  >
    <div className="flex flex-col gap-2">
      {rule && (
        <span
          aria-hidden
          className={cn("mb-1 h-[3px] w-10 rounded-full", rules[tone] || rules.default)}
        />
      )}
      {eyebrow && <Eyebrow tone={tone}>{eyebrow}</Eyebrow>}
      {title && (
        <Heading className={cn(size === "h2" ? "text-h2" : "text-h3", "text-ink")}>
          {title}
        </Heading>
      )}
      {description && (
        <p className="max-w-prose text-ui text-ink-3">{description}</p>
      )}
    </div>
    {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
  </div>
);

export default SectionHeader;
