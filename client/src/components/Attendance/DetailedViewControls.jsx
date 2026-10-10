import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, CalendarPlus } from "lucide-react";
import { Button, Card, Eyebrow, controlBase, cn } from "../ui";

const DetailedViewControls = ({
  selectedSubject,
  selectedDate,
  onDateChange,
  onMarkTodayClick,
  maxDate,
  isActionDisabled,
}) => (
  <Card padding="lg" className="grid items-end gap-6 md:grid-cols-3">
    <div className="min-w-0">
      <Eyebrow>Viewing</Eyebrow>
      <p
        className="mt-2 truncate text-h4 text-ink"
        title={selectedSubject?.name}
      >
        {selectedSubject?.name || "—"}
      </p>
      <p className="mt-0.5 text-micro text-ink-4">
        {selectedSubject?.code || "—"}
      </p>
    </div>

    <div>
      <label
        htmlFor="detailSelectedDate"
        className="mb-1.5 block text-meta font-medium text-ink-2"
      >
        Date
      </label>
      <div className="relative">
        <Calendar
          className="pointer-events-none absolute left-3.5 top-1/2 z-10 size-4 -translate-y-1/2 text-ink-4"
          aria-hidden
        />
        <DatePicker
          selected={selectedDate}
          onChange={onDateChange}
          dateFormat="yyyy-MM-dd"
          placeholderText="YYYY-MM-DD"
          className={cn(controlBase, "h-11 cursor-pointer pl-10 pr-3.5")}
          maxDate={maxDate}
          id="detailSelectedDate"
          popperPlacement="bottom-start"
        />
      </div>
    </div>

    <div className="md:justify-self-end">
      <Button
        onClick={onMarkTodayClick}
        loading={isActionDisabled}
        leadingIcon={CalendarPlus}
        fullWidth
        className="md:w-auto"
      >
        Mark for today
      </Button>
    </div>
  </Card>
);

export default DetailedViewControls;
