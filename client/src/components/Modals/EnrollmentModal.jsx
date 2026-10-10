import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Check, Lock, Search } from "lucide-react";
import toast from "react-hot-toast";
import {
  clearEnrollmentError,
  enrollInSubject,
} from "../../slices/enrollmentSlice";
import { clearResourcesError, fetchSubjects } from "../../features/resource";
import {
  Button,
  Input,
  Modal,
  Spinner,
  cn,
} from "../ui";
import ErrorDisplay from "../../utils/ErrorDisplay";

/**
 * This file used to import react-modal, define a customStyles object and call
 * Modal.setAppElement — about 30 lines of configuration that the JSX never
 * used, because it rendered a raw `fixed inset-0` div instead. Now on the
 * shared Modal primitive.
 */
const EnrollmentModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const {
    subjects: availableSubjects,
    loading: subjectsLoading,
    error: subjectsError,
  } = useSelector((state) => state.resource);
  const {
    userEnrollments,
    loading: enrollLoading,
    error: enrollError,
  } = useSelector((state) => state.enrollment);

  const [selectedSubjectIds, setSelectedSubjectIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  const userId = user?.id;
  const enrolledSubjectIds = useMemo(
    () => new Set(userEnrollments.map((s) => s.id)),
    [userEnrollments]
  );

  const filteredSubjects = useMemo(() => {
    if (!availableSubjects) return [];
    const term = searchTerm.toLowerCase();
    return availableSubjects.filter(
      (subject) =>
        subject.name.toLowerCase().includes(term) ||
        subject.code.toLowerCase().includes(term)
    );
  }, [availableSubjects, searchTerm]);

  useEffect(() => {
    if (isOpen && (!availableSubjects.length || subjectsError)) {
      dispatch(fetchSubjects());
    }
    return () => {
      if (subjectsError) dispatch(clearResourcesError());
      if (enrollError) dispatch(clearEnrollmentError());
    };
  }, [isOpen, dispatch, availableSubjects.length, subjectsError, enrollError]);

  const handleSubjectToggle = (subjectId) => {
    setSelectedSubjectIds((prev) => {
      const next = new Set(prev);
      if (next.has(subjectId)) next.delete(subjectId);
      else next.add(subjectId);
      return next;
    });
  };

  const handleEnroll = useCallback(async () => {
    if (!userId || selectedSubjectIds.size === 0) return;

    const results = await Promise.allSettled(
      Array.from(selectedSubjectIds).map((subjectId) =>
        dispatch(enrollInSubject({ userId, subjectId })).unwrap()
      )
    );

    const successCount = results.filter((r) => r.status === "fulfilled").length;
    const failureCount = results.length - successCount;

    if (successCount > 0) {
      toast.success(
        `Enrolled in ${successCount} subject${successCount === 1 ? "" : "s"}.`
      );
    }
    if (failureCount > 0) {
      toast.error(
        `${failureCount} subject${failureCount === 1 ? "" : "s"} could not be added.`
      );
    }

    if (successCount > 0) {
      setSelectedSubjectIds(new Set());
      onClose();
    }
  }, [dispatch, userId, selectedSubjectIds, onClose]);

  const handleClose = () => {
    if (subjectsError) dispatch(clearResourcesError());
    if (enrollError) dispatch(clearEnrollmentError());
    setSearchTerm("");
    setSelectedSubjectIds(new Set());
    onClose();
  };

  const count = selectedSubjectIds.size;

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      size="lg"
      title="Enroll in subjects"
      description="Pick everything you are taking this semester."
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleEnroll}
            loading={enrollLoading}
            disabled={count === 0}
          >
            {count === 0
              ? "Select subjects"
              : `Enroll in ${count} subject${count === 1 ? "" : "s"}`}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          type="search"
          placeholder="Search by name or code"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leadingIcon={Search}
        />

        {subjectsError && (
          <ErrorDisplay
            error={subjectsError}
            onRetry={() => dispatch(fetchSubjects())}
            messagePrefix="Subjects: "
          />
        )}
        {enrollError && <ErrorDisplay error={enrollError} />}

        {subjectsLoading && !availableSubjects.length ? (
          <div className="flex items-center gap-3 py-8 text-ink-3">
            <Spinner size="sm" />
            <span className="text-ui">Loading subjects…</span>
          </div>
        ) : filteredSubjects.length === 0 ? (
          <p className="py-8 text-ui text-ink-4">
            {searchTerm
              ? `Nothing matches "${searchTerm}".`
              : "No subjects are available to enroll in."}
          </p>
        ) : (
          <ul className="-mx-1 max-h-[22rem] overflow-y-auto">
            {filteredSubjects.map((subject) => {
              const alreadyEnrolled = enrolledSubjectIds.has(subject.id);
              const selected = selectedSubjectIds.has(subject.id);

              return (
                <li key={subject.id}>
                  <label
                    className={cn(
                      "flex items-center gap-3 rounded-chip px-3 py-3 transition-colors duration-150",
                      alreadyEnrolled
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer hover:bg-surface-2"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      disabled={alreadyEnrolled}
                      onChange={() => handleSubjectToggle(subject.id)}
                      className="sr-only"
                    />
                    <span
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-[5px] border transition-colors duration-150",
                        selected
                          ? "border-accent bg-accent text-canvas"
                          : "border-line-3 bg-surface-2"
                      )}
                      aria-hidden
                    >
                      {selected && <Check className="size-3.5" />}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-ui text-ink">
                        {subject.name}
                      </span>
                      <span className="block text-micro text-ink-4">
                        {subject.code}
                      </span>
                    </span>

                    {alreadyEnrolled && (
                      <span className="flex shrink-0 items-center gap-1.5 text-micro text-ink-4">
                        <Lock className="size-3" aria-hidden />
                        Enrolled
                      </span>
                    )}
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Modal>
  );
};

export default EnrollmentModal;
