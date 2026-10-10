import React from "react";
import { PlusSquare } from "lucide-react";
import { Button, SectionHeader } from "../ui";

const AttendancePageHeader = ({ onEnrollMoreClick, enrollError }) => (
  <SectionHeader
    eyebrow="ClassPulse"
    tone="pulse"
    rule
    title="Attendance"
    description="Where you stand against the 75% line, subject by subject."
    as="h1"
    size="h2"
    action={
      !enrollError && (
        <Button
          variant="outline"
          leadingIcon={PlusSquare}
          onClick={onEnrollMoreClick}
        >
          Enroll in subjects
        </Button>
      )
    }
  />
);

export default AttendancePageHeader;
