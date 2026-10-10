import React from "react";
import { cn } from "./cn";

/**
 * Attendance thresholds. This logic used to be duplicated between
 * PercentageCicleGraph and SubjectSummaryCard, with the two drifting apart.
 */
export const toneForPercentage = (value) => {
  if (value >= 75) return "positive";
  if (value >= 50) return "caution";
  return "critical";
};

const strokes = {
  positive: "text-positive",
  caution: "text-caution",
  critical: "text-clay-soft",
  accent: "text-accent",
  ink: "text-ink",
};

const fills = {
  positive: "bg-positive",
  caution: "bg-caution",
  critical: "bg-clay",
  accent: "bg-accent",
  ink: "bg-ink",
};

/* ----------------------------------------------------------- ProgressRing -- */

/**
 * Replaces Graphs/PercentageCicleGraph.jsx. The label now scales with `size`,
 * which the old one did not — it was illegible at 40px and undersized at 90px.
 */
export const ProgressRing = ({
  value = 0,
  size = 72,
  strokeWidth,
  tone,
  showLabel = true,
  label,
  className,
}) => {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  const width = strokeWidth ?? Math.max(3, Math.round(size * 0.08));
  const radius = (size - width) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (pct / 100) * circumference;
  const resolved = tone || toneForPercentage(pct);

  return (
    <div
      className={cn("relative inline-flex shrink-0 items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={label || `${Math.round(pct)} percent`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={width}
          stroke="currentColor"
          className="text-line-2"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={width}
          strokeLinecap="round"
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn("transition-[stroke-dashoffset] duration-500 ease-standard", strokes[resolved])}
        />
      </svg>
      {showLabel && (
        <span
          className="numeric absolute font-display font-bold text-ink"
          style={{ fontSize: Math.max(10, Math.round(size * 0.26)) }}
        >
          {Math.round(pct)}
          <span className="text-ink-4">%</span>
        </span>
      )}
    </div>
  );
};

/* ------------------------------------------------------------ ProgressBar -- */

export const ProgressBar = ({
  value = 0,
  tone,
  size = "md",
  className,
  trackClassName,
  label,
}) => {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  const resolved = tone || toneForPercentage(pct);

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-full bg-line",
        size === "sm" ? "h-1" : size === "lg" ? "h-2.5" : "h-1.5",
        trackClassName,
        className
      )}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-500 ease-standard",
          fills[resolved]
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

export default ProgressRing;
