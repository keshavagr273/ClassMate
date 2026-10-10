import React from "react";
import SubjectStatCard from "./SubjectStatCard";
import LoadingSpinner from "../../utils/LoadingSpinner";
import ErrorDisplay from "../../utils/ErrorDisplay";
import { Eyebrow } from "../ui";

const SubjectBreakdownSection = ({
  errorSubjectPercentages,
  onRetrySubjectWise,
  loadingSubjectPercentages,
  subjectPercentageList = [],
  userEnrollments = [],
  selectedSubjectId,
  unrollingSubjectId,
  onSubjectSelect,
  onUnenrollSubject,
  unenrollLoading,
}) => (
  <section>
    <div className="flex items-baseline justify-between gap-4">
      <Eyebrow>Your subjects</Eyebrow>
      <span className="numeric text-micro text-ink-4">
        {userEnrollments.length} enrolled
      </span>
    </div>

    {errorSubjectPercentages && (
      <div className="mt-4">
        <ErrorDisplay
          error={errorSubjectPercentages}
          onRetry={onRetrySubjectWise}
          messagePrefix="Subject stats: "
        />
      </div>
    )}

    {loadingSubjectPercentages &&
      subjectPercentageList.length === 0 &&
      userEnrollments.length > 0 && <LoadingSpinner />}

    {!loadingSubjectPercentages &&
      userEnrollments.length > 0 &&
      subjectPercentageList.length === 0 &&
      !errorSubjectPercentages && (
        <p className="mt-4 text-ui text-ink-4">
          Nothing marked yet for any enrolled subject. Pick one below to start.
        </p>
      )}

    {userEnrollments.length > 0 && (
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {userEnrollments.map((enrollment) => {
          const stats = subjectPercentageList.find(
            (p) => p.subjectId === enrollment.id
          );
          return (
            <SubjectStatCard
              key={enrollment.id}
              enrollment={enrollment}
              stats={stats}
              isLoadingThisStat={loadingSubjectPercentages && !stats}
              isSelected={selectedSubjectId === enrollment.id.toString()}
              isUnenrolling={unrollingSubjectId === enrollment.id}
              onClick={onSubjectSelect}
              onUnenrollClick={onUnenrollSubject}
              unenrollLoading={unenrollLoading}
            />
          );
        })}
      </div>
    )}
  </section>
);

export default SubjectBreakdownSection;
