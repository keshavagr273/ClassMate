import React from "react";
import LoadingSpinner from "../../utils/LoadingSpinner";
import ErrorDisplay from "../../utils/ErrorDisplay";
import { Card, Eyebrow, ProgressRing } from "../ui";

const OverallSummaryCard = ({
  errorOverall,
  onRetryOverall,
  loadingOverall,
  overallPercentageData,
}) => (
  <Card padding="lg">
    <Eyebrow>Overall</Eyebrow>

    {errorOverall && (
      <div className="mt-4">
        <ErrorDisplay
          error={errorOverall}
          onRetry={onRetryOverall}
          messagePrefix="Overall stats: "
        />
      </div>
    )}

    {loadingOverall && !overallPercentageData && <LoadingSpinner />}

    {overallPercentageData ? (
      <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-center">
        <ProgressRing value={overallPercentageData.percentage} size={88} />

        <dl className="grid flex-1 grid-cols-3 gap-4 border-t border-line pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
          {[
            ["Present", overallPercentageData.presentDays, "text-positive"],
            ["Absent", overallPercentageData.absentDays, "text-clay-soft"],
            ["Total", overallPercentageData.totalDays, "text-ink"],
          ].map(([label, value, tone]) => (
            <div key={label}>
              <dd className={`numeric font-display text-h3 font-bold ${tone}`}>
                {value}
              </dd>
              <dt className="mt-0.5 text-eyebrow uppercase text-ink-4">
                {label}
              </dt>
            </div>
          ))}
        </dl>
      </div>
    ) : (
      !loadingOverall &&
      !errorOverall && (
        <p className="mt-4 text-ui text-ink-4">
          Nothing marked yet, so there is no overall figure to show.
        </p>
      )
    )}
  </Card>
);

export default OverallSummaryCard;
