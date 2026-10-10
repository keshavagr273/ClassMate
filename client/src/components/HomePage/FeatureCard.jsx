import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { cn } from "../ui";

/**
 * One tool card. Each tool owns a hue, which appears only on the icon chip and
 * on hover — a precise signal, not a wash. The previous version took a
 * `gradient` prop (a `from-x via-y to-z` string) and applied it to the chip
 * *and* as a bg-clip-text fill on the title; six different multi-hue gradients
 * across six cards was most of why the page read as generated.
 *
 * Tailwind cannot build class names from interpolated strings, so the hues are
 * a static lookup rather than `text-${accent}`.
 */
const accents = {
  skill: {
    chip: "border-skill/30 bg-skill-faint text-skill",
    glow: "group-hover:border-skill/40",
    rule: "bg-skill",
  },
  jobs: {
    chip: "border-jobs/30 bg-jobs-faint text-jobs",
    glow: "group-hover:border-jobs/40",
    rule: "bg-jobs",
  },
  pulse: {
    chip: "border-pulse/30 bg-pulse-faint text-pulse",
    glow: "group-hover:border-pulse/40",
    rule: "bg-pulse",
  },
  bazaar: {
    chip: "border-bazaar/30 bg-bazaar-faint text-bazaar",
    glow: "group-hover:border-bazaar/40",
    rule: "bg-bazaar",
  },
  found: {
    chip: "border-found/30 bg-found-faint text-found",
    glow: "group-hover:border-found/40",
    rule: "bg-found",
  },
  ride: {
    chip: "border-ride/30 bg-ride-faint text-ride",
    glow: "group-hover:border-ride/40",
    rule: "bg-ride",
  },
};

const FeatureCard = React.memo(function FeatureCard({
  icon: Icon,
  title,
  description,
  href,
  accent = "skill",
  index,
}) {
  const tone = accents[accent] || accents.skill;

  return (
    <Link
      to={href}
      className={cn(
        "group relative flex h-full flex-col justify-between gap-8 overflow-hidden rounded-card",
        "border border-line bg-surface p-6",
        "transition-colors duration-200 ease-standard hover:bg-surface-2",
        tone.glow
      )}
    >
      {/* A 2px rule in the tool's colour, revealed on hover. */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 transition-transform duration-300 ease-standard group-hover:scale-x-100",
          tone.rule
        )}
      />

      <div className="flex items-start justify-between gap-4">
        <span
          className={cn(
            "flex size-10 items-center justify-center rounded-chip border transition-colors duration-200",
            tone.chip
          )}
        >
          {Icon && <Icon className="size-[18px]" aria-hidden />}
        </span>
        {index != null && (
          <span className="numeric text-eyebrow text-ink-4">
            {String(index + 1).padStart(2, "0")}
          </span>
        )}
      </div>

      <div>
        <h3 className="flex items-center gap-1.5 text-h4 text-ink">
          {title}
          <ArrowUpRight
            className="size-4 text-ink-4 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
            aria-hidden
          />
        </h3>
        <p className="mt-2 text-meta text-ink-3">{description}</p>
      </div>
    </Link>
  );
});

export default FeatureCard;
