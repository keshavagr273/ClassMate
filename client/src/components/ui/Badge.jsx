import React from "react";
import { cn } from "./cn";

const tones = {
  neutral: "border-line-2 bg-surface-2 text-ink-2",
  ink: "border-line-3 bg-surface-3 text-ink",
  accent: "border-accent/25 bg-accent-faint text-accent-dim",
  positive: "border-positive/30 bg-positive-faint text-positive",
  caution: "border-caution/30 bg-caution-faint text-caution",
  critical: "border-clay/35 bg-clay-faint text-clay-soft",
};

const Badge = ({ tone = "neutral", icon: Icon, className, children, ...props }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5",
      "text-micro font-medium whitespace-nowrap",
      tones[tone] || tones.neutral,
      className
    )}
    {...props}
  >
    {Icon && <Icon className="size-3 shrink-0" aria-hidden />}
    {children}
  </span>
);

export default Badge;
