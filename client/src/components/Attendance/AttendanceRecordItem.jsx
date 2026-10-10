import React from "react";
import { Check, Pencil, X } from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { IconButton, cn } from "../ui";

const AttendanceRecordItem = ({ record, onEditClick, isActionDisabled }) => {
  const present = record.status === "Present";

  return (
    <div className="flex items-center justify-between gap-3 border-b border-line py-3 last:border-0">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full border",
            present
              ? "border-positive/30 bg-positive-faint text-positive"
              : "border-clay/30 bg-clay-faint text-clay-soft"
          )}
        >
          {present ? (
            <Check className="size-3.5" aria-hidden />
          ) : (
            <X className="size-3.5" aria-hidden />
          )}
        </span>

        <div className="min-w-0">
          <p
            className={cn(
              "text-ui font-medium",
              present ? "text-positive" : "text-clay-soft"
            )}
          >
            {record.status}
          </p>
          {record.markedAt && isValid(parseISO(record.markedAt)) && (
            <time className="text-micro text-ink-4">
              Marked at {format(parseISO(record.markedAt), "HH:mm")}
            </time>
          )}
        </div>
      </div>

      <IconButton
        icon={Pencil}
        label="Edit attendance status"
        size="sm"
        onClick={() => onEditClick("edit", record)}
        disabled={isActionDisabled}
      />
    </div>
  );
};

export default AttendanceRecordItem;
