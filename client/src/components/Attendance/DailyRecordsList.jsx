import React from "react";
import { format } from "date-fns";
import AttendanceRecordItem from "./AttendanceRecordItem";
import NoRecordsFound from "./NoRecordsFound";
import LoadingSpinner from "../../utils/LoadingSpinner";
import ErrorDisplay from "../../utils/ErrorDisplay";
import { Card, Eyebrow, cn } from "../ui";

const DailyRecordsList = ({
  selectedDate,
  attendError,
  onRetryDetailed,
  attendLoading,
  records = [],
  onEditRecordClick,
  onMarkThisDateClick,
  isActionDisabled,
}) => {
  const sortedRecords = [...records].sort((a, b) =>
    a.markedAt && b.markedAt ? new Date(a.markedAt) - new Date(b.markedAt) : 0
  );

  return (
    <Card padding="lg" className="flex min-h-[20rem] flex-col">
      <Eyebrow>
        {selectedDate
          ? format(selectedDate, "eee, d MMM yyyy")
          : "Selected date"}
      </Eyebrow>

      {attendError && (
        <div className="mt-4">
          <ErrorDisplay
            error={attendError}
            onRetry={onRetryDetailed}
            messagePrefix="Records: "
          />
        </div>
      )}

      {attendLoading && records.length === 0 && <LoadingSpinner />}

      {!attendError && !attendLoading && records.length === 0 && (
        <NoRecordsFound
          selectedDate={selectedDate}
          onMarkThisDateClick={onMarkThisDateClick}
          isActionDisabled={isActionDisabled}
        />
      )}

      {!attendError && records.length > 0 && (
        <div className={cn("mt-2", attendLoading && "opacity-60")}>
          {sortedRecords.map((record) => (
            <AttendanceRecordItem
              key={record.id}
              record={record}
              onEditClick={onEditRecordClick}
              isActionDisabled={isActionDisabled}
            />
          ))}
        </div>
      )}
    </Card>
  );
};

export default DailyRecordsList;
