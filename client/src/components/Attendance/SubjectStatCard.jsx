import React from "react";
import { Loader2, Trash2 } from "lucide-react";
import { ProgressRing, Spinner, cn } from "../ui";

const SubjectStatCard = ({
  enrollment,
  stats,
  isLoadingThisStat,
  isSelected,
  isUnenrolling,
  onClick,
  onUnenrollClick,
  unenrollLoading,
}) => (
  <div
    className={cn(
      "group relative rounded-card border p-4 transition-colors duration-150 ease-standard",
      isSelected
        ? "border-accent/40 bg-accent-faint"
        : "border-line bg-surface",
      isUnenrolling
        ? "cursor-default opacity-50"
        : !isSelected && "hover:border-line-3 hover:bg-surface-2"
    )}
  >
    <button
      type="button"
      onClick={() => !isUnenrolling && onClick(enrollment.id)}
      className="w-full cursor-pointer text-left"
      aria-pressed={isSelected}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 pr-4">
          <h4 className="truncate text-ui font-medium text-ink" title={enrollment.name}>
            {enrollment.name}
          </h4>
          <p className="mt-0.5 text-micro text-ink-4">{enrollment.code}</p>
        </div>

        <div className="shrink-0">
          {isLoadingThisStat ? (
            <span className="flex size-11 items-center justify-center text-ink-3">
              <Spinner size="sm" />
            </span>
          ) : stats ? (
            <ProgressRing value={stats.percentage} size={44} />
          ) : null}
        </div>
      </div>

      {stats && !isLoadingThisStat ? (
        <dl className="mt-4 flex gap-5 border-t border-line pt-3 text-micro">
          <div className="flex items-center gap-1.5">
            <dt className="text-ink-4">Present</dt>
            <dd className="numeric font-medium text-positive">
              {stats.presentDays}
            </dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt className="text-ink-4">Absent</dt>
            <dd className="numeric font-medium text-clay-soft">
              {stats.absentDays}
            </dd>
          </div>
        </dl>
      ) : (
        !isLoadingThisStat && (
          <p className="mt-4 border-t border-line pt-3 text-micro text-ink-4">
            No records yet
          </p>
        )
      )}
    </button>

    {/* Revealed on hover, and on keyboard focus so it stays reachable. */}
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onUnenrollClick(enrollment.id);
      }}
      disabled={isUnenrolling || unenrollLoading}
      title={`Unenroll from ${enrollment.name}`}
      aria-label={`Unenroll from ${enrollment.name}`}
      className={cn(
        "absolute right-2 top-2 z-10 flex size-7 items-center justify-center rounded-full",
        "text-ink-4 transition-all duration-150 hover:bg-clay-faint hover:text-clay-soft",
        isUnenrolling
          ? "cursor-wait opacity-50"
          : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
        unenrollLoading && !isUnenrolling && "cursor-not-allowed"
      )}
    >
      {isUnenrolling ? (
        <Loader2 className="size-3.5 animate-spin" aria-hidden />
      ) : (
        <Trash2 className="size-3.5" aria-hidden />
      )}
    </button>
  </div>
);

export default SubjectStatCard;
