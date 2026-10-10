import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Check, X } from "lucide-react";
import toast from "react-hot-toast";
import {
  clearAttendanceError,
  markAttendance,
  updateAttendance,
} from "../../slices/attendanceSlice";
import { Button, Eyebrow, Modal, cn } from "../ui";
import ErrorDisplay from "../../utils/ErrorDisplay";

const options = [
  {
    value: "Present",
    icon: Check,
    active: "border-positive/50 bg-positive-faint text-positive",
  },
  {
    value: "Absent",
    icon: X,
    active: "border-clay/50 bg-clay-faint text-clay-soft",
  },
];

/**
 * Was built on react-modal with a customStyles object that made react-modal's
 * own panel transparent so a motion.div inside could be the real panel. Now on
 * the shared Modal primitive, which brings the focus trap and scroll lock the
 * rest of the app's overlays never had.
 */
const AttendanceFormModal = ({
  isOpen,
  onClose,
  mode = "create",
  initialData,
}) => {
  const dispatch = useDispatch();
  const { loading: attendanceLoading, error: attendanceError } = useSelector(
    (state) => state.attendance
  );
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (isOpen) {
      setStatus(mode === "edit" ? initialData?.status || "" : "");
      if (attendanceError) dispatch(clearAttendanceError());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mode, initialData, dispatch]);

  const handleClose = () => {
    if (attendanceError) dispatch(clearAttendanceError());
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!status) {
      toast.error("Choose Present or Absent.");
      return;
    }

    const action =
      mode === "create"
        ? markAttendance({
            userId: initialData.userId,
            subjectId: initialData.subjectId,
            date: initialData.date,
            status,
          })
        : updateAttendance({ recordId: initialData.recordId, status });

    try {
      await dispatch(action).unwrap();
      onClose();
    } catch {
      /* surfaced via attendanceError */
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      size="md"
      title={mode === "edit" ? "Edit attendance" : "Mark attendance"}
      description={initialData?.subjectName}
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={attendanceLoading}
            disabled={!status}
          >
            {mode === "edit" ? "Save change" : "Mark"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {initialData?.date && (
          <div className="flex items-baseline justify-between gap-4 border-b border-line pb-4">
            <Eyebrow>Date</Eyebrow>
            <time className="numeric text-ui text-ink">{initialData.date}</time>
          </div>
        )}

        <fieldset>
          <legend className="text-meta font-medium text-ink-2">Status</legend>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {options.map((option) => {
              const Icon = option.icon;
              const selected = status === option.value;
              return (
                <label
                  key={option.value}
                  className={cn(
                    "flex cursor-pointer items-center justify-center gap-2 rounded-card border px-4 py-4",
                    "text-ui font-medium transition-colors duration-150 ease-standard",
                    selected
                      ? option.active
                      : "border-line bg-surface-2 text-ink-3 hover:border-line-3 hover:text-ink"
                  )}
                >
                  <input
                    type="radio"
                    name="status"
                    value={option.value}
                    checked={selected}
                    onChange={() => setStatus(option.value)}
                    className="sr-only"
                  />
                  <Icon className="size-4" aria-hidden />
                  {option.value}
                </label>
              );
            })}
          </div>
        </fieldset>

        {attendanceError && <ErrorDisplay error={attendanceError} />}
      </form>
    </Modal>
  );
};

export default AttendanceFormModal;
