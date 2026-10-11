import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../ui";

/**
 * One tool card. Each tool owns a hue, which appears on the icon chip, a rule
 * that wipes in on hover, and a wash that fades up from the bottom edge.
 *
 * Tailwind cannot build class names from interpolated strings, so the hues are
 * a static lookup rather than `text-${accent}`.
 */
const accents = {
  skill: {
    chip: "border-skill/30 bg-skill-faint text-skill",
    border: "group-hover:border-skill/45",
    rule: "bg-skill",
    wash: "from-skill/[0.07]",
    tick: "text-skill",
  },
  jobs: {
    chip: "border-jobs/30 bg-jobs-faint text-jobs",
    border: "group-hover:border-jobs/45",
    rule: "bg-jobs",
    wash: "from-jobs/[0.07]",
    tick: "text-jobs",
  },
  pulse: {
    chip: "border-pulse/30 bg-pulse-faint text-pulse",
    border: "group-hover:border-pulse/45",
    rule: "bg-pulse",
    wash: "from-pulse/[0.07]",
    tick: "text-pulse",
  },
  bazaar: {
    chip: "border-bazaar/30 bg-bazaar-faint text-bazaar",
    border: "group-hover:border-bazaar/45",
    rule: "bg-bazaar",
    wash: "from-bazaar/[0.07]",
    tick: "text-bazaar",
  },
  found: {
    chip: "border-found/30 bg-found-faint text-found",
    border: "group-hover:border-found/45",
    rule: "bg-found",
    wash: "from-found/[0.07]",
    tick: "text-found",
  },
  ride: {
    chip: "border-ride/30 bg-ride-faint text-ride",
    border: "group-hover:border-ride/45",
    rule: "bg-ride",
    wash: "from-ride/[0.07]",
    tick: "text-ride",
  },
};

const ease = [0.16, 1, 0.3, 1];

const FeatureCard = React.memo(function FeatureCard({
  icon: Icon,
  title,
  description,
  href,
  accent = "skill",
  index = 0,
  stat,
  points = [],
  featured = false,
}) {
  const tone = accents[accent] || accents.skill;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.4, ease, delay: Math.min(index, 5) * 0.05 }}
      className={featured ? "lg:col-span-2" : undefined}
    >
      <Link
        to={href}
        className={cn(
          "group relative flex h-full flex-col overflow-hidden rounded-card",
          "border border-line bg-surface",
          "transition-colors duration-200 ease-standard hover:bg-surface-2",
          tone.border,
          featured ? "gap-8 p-7" : "gap-7 p-6"
        )}
      >
        {/* Rule in the tool's colour, wiping in from the left on hover. */}
        <span
          aria-hidden
          className={cn(
            "absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0",
            "transition-transform duration-300 ease-standard group-hover:scale-x-100",
            tone.rule
          )}
        />
        {/* A barely-there wash so the hue reads on the whole card, not just the chip. */}
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t to-transparent",
            "opacity-0 transition-opacity duration-300 group-hover:opacity-100",
            tone.wash
          )}
        />

        <div className="relative flex items-start justify-between gap-4">
          <span
            className={cn(
              "flex items-center justify-center rounded-chip border transition-colors duration-200",
              featured ? "size-12" : "size-10",
              tone.chip
            )}
          >
            {Icon && (
              <Icon className={featured ? "size-5" : "size-[18px]"} aria-hidden />
            )}
          </span>

          <div className="flex items-center gap-3">
            {stat && (
              <span className="numeric rounded-full border border-line-2 px-2.5 py-1 text-micro text-ink-3">
                {stat}
              </span>
            )}
            <span className="numeric text-eyebrow text-ink-4">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>
        </div>

        <div className="relative mt-auto">
          <h3
            className={cn(
              "flex items-center gap-1.5 text-ink",
              featured ? "text-h3" : "text-h4"
            )}
          >
            {title}
            <ArrowUpRight
              className="size-4 text-ink-4 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
              aria-hidden
            />
          </h3>
          <p
            className={cn(
              "mt-2 text-ink-3",
              featured ? "max-w-md text-ui" : "text-meta"
            )}
          >
            {description}
          </p>

          {points.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-4">
              {points.map((point) => (
                <li
                  key={point}
                  className="flex items-center gap-1.5 text-meta text-ink-3"
                >
                  <Check className={cn("size-3.5 shrink-0", tone.tick)} aria-hidden />
                  {point}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Link>
    </motion.div>
  );
});

export default FeatureCard;
