import React from "react";
import { cn } from "./cn";

/**
 * Empty and error states. Left-aligned, one specific sentence, one action —
 * not a large centered icon over "No items found!".
 */
const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  tone = "neutral",
  className,
  ...props
}) => (
  <div
    className={cn(
      "flex flex-col items-start gap-3 rounded-card border border-dashed px-6 py-10",
      tone === "critical"
        ? "border-clay/30 bg-clay-faint/40"
        : "border-line-2 bg-surface/40",
      className
    )}
    {...props}
  >
    {Icon && (
      <Icon
        className={cn(
          "size-5",
          tone === "critical" ? "text-clay-soft" : "text-ink-4"
        )}
        aria-hidden
      />
    )}
    {title && <p className="text-h4 text-ink">{title}</p>}
    {description && (
      <p className="max-w-prose text-ui text-ink-3">{description}</p>
    )}
    {action && <div className="mt-1 flex items-center gap-2">{action}</div>}
  </div>
);

export default EmptyState;
