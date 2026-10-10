import React from "react";
import { CalendarPlus } from "lucide-react";
import { format } from "date-fns";
import { Button, EmptyState } from "../ui";

const NoRecordsFound = ({
  selectedDate,
  onMarkThisDateClick,
  isActionDisabled,
}) => (
  <EmptyState
    title="Nothing marked yet"
    description={`No attendance has been recorded for this subject on ${
      selectedDate ? format(selectedDate, "d MMM yyyy") : "the selected date"
    }.`}
    className="my-auto"
    action={
      <Button
        size="sm"
        leadingIcon={CalendarPlus}
        disabled={isActionDisabled}
        onClick={() => onMarkThisDateClick("create", null, selectedDate)}
      >
        Mark for this date
      </Button>
    }
  />
);

export default NoRecordsFound;
