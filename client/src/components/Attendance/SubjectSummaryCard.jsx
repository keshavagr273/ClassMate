import React from "react";
import LoadingSpinner from "../../utils/LoadingSpinner";
import ErrorDisplay from "../../utils/ErrorDisplay";
import { Card, Eyebrow, ProgressBar, toneForPercentage, cn } from "../ui";

const tones = {
  positive: "text-positive",
  caution: "text-caution",
  critical: "text-clay-soft",
};

const SubjectSummaryCard = ({
  errorPercentage,
  onRetryDetailed,
  loadingPercentage,
  percentageData,
}) => {
  const pct = percentageData?.percentage ?? 0;
  // Threshold logic now lives in one place (ui/Progress.jsx); this used to
  // carry its own copy, which had already drifted from the ring's.
  const tone = toneForPercentage(pct);

  return (
    <Card padding="lg" className="sticky top-20">
      <Eyebrow>This subject</Eyebrow>

      {errorPercentage && (
        <div className="mt-4">
          <ErrorDisplay
            error={errorPercentage}
            onRetry={onRetryDetailed}
            messagePrefix="Subject summary: "
          />
        </div>
      )}

      {loadingPercentage && !percentageData && <LoadingSpinner />}

      {percentageData ? (
        <div className="mt-5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-meta text-ink-3">Attendance</span>
            <span
              className={cn(
                "numeric font-display text-h3 font-bold",
                tones[tone]
              )}
            >
              {pct.toFixed(1)}%
            </span>
          </div>

          <ProgressBar value={pct} className="mt-3" size="lg" />

          <dl className="mt-5 border-t border-line">
            {[
              ["Present", percentageData.presentDays, "text-positive"],
              ["Absent", percentageData.absentDays, "text-clay-soft"],
              ["Total marked", percentageData.totalDays, "text-ink"],
            ].map(([label, value, valueTone]) => (
              <div
                key={label}
                className="flex items-center justify-between border-b border-line py-2.5 last:border-0"
              >
                <dt className="text-meta text-ink-4">{label}</dt>
                <dd className={cn("numeric text-ui font-medium", valueTone)}>
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ) : (
        !loadingPercentage &&
        !errorPercentage && (
          <p className="mt-4 text-ui text-ink-4">
            Nothing marked for this subject yet.
          </p>
        )
      )}
    </Card>
  );
};

export default SubjectSummaryCard;
