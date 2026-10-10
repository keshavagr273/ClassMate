// src/pages/attendance/AttendancePage.jsx
import React, { useCallback, useEffect, useState, lazy, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import { format, isValid, parseISO, startOfDay } from "date-fns";
import toast from "react-hot-toast";
import { BookOpen } from "lucide-react";

// --- Redux Actions ---
import {
  clearEnrollmentError,
  fetchUserEnrollments,
  resetEnrollments,
  unenrollFromSubject,
} from "../../slices/enrollmentSlice";
import {
  clearAttendanceError,
  clearDetailedAttendance,
  fetchAttendancePercentage,
  fetchAttendanceRecords,
  fetchOverallPercentage,
  fetchSubjectWisePercentages,
  resetAttendance,
} from "../../slices/attendanceSlice";

// --- Child Components ---
import AttendancePageHeader from "../../components/Attendance/AttendancePageHeader";
import OverallSummaryCard from "../../components/Attendance/OverallSummaryCard";
import SubjectBreakdownSection from "../../components/Attendance/SubjectBreakdownSection";
import DetailedViewControls from "../../components/Attendance/DetailedViewControls";
import SubjectSummaryCard from "../../components/Attendance/SubjectSummaryCard";
import DailyRecordsList from "../../components/Attendance/DailyRecordsList";
import ErrorDisplay from "../../utils/ErrorDisplay";
import {
  Button,
  EmptyState,
  PageShell,
  Spinner,
} from "../../components/ui";

// --- Lazy Load Modals ---
const AttendanceFormModal = lazy(
  () => import("../../components/Modals/AttendanceFormModal")
);
const EnrollmentModal = lazy(
  () => import("../../components/Modals/EnrollmentModal")
);

const AttendancePage = () => {
  const dispatch = useDispatch();

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const {
    userEnrollments,
    loading: enrollLoading,
    error: enrollError,
    unenrollLoading,
  } = useSelector((state) => state.enrollment);
  const {
    records,
    percentageData,
    loading: attendLoading,
    loadingPercentage,
    error: attendError,
    errorPercentage,
    overallPercentageData,
    subjectPercentageList,
    loadingOverall,
    errorOverall,
    loadingSubjectPercentages,
    errorSubjectPercentages,
  } = useSelector((state) => state.attendance);

  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [attendanceModalState, setAttendanceModalState] = useState({
    isOpen: false,
    mode: "create",
    data: null,
  });
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [unrollingSubjectId, setUnrollingSubjectId] = useState(null);

  const userId = user?.id;
  const selectedSubjectForDetails = userEnrollments.find(
    (s) => s.id === parseInt(selectedSubjectId, 10)
  );
  const isDetailedActionDisabled = attendLoading || attendanceModalState.isOpen;

  /* -------------------------------------------------------------- fetching */

  useEffect(() => {
    if (isAuthenticated && userId) {
      dispatch(fetchUserEnrollments(userId))
        .unwrap()
        .then((enrollments) => {
          if (enrollments?.length > 0) {
            dispatch(fetchOverallPercentage(userId));
            dispatch(fetchSubjectWisePercentages(userId));
            if (
              selectedSubjectId &&
              !enrollments.some((e) => e.id === parseInt(selectedSubjectId, 10))
            ) {
              setSelectedSubjectId("");
              dispatch(clearDetailedAttendance());
            }
          } else {
            dispatch(resetAttendance());
            setSelectedSubjectId("");
            dispatch(clearDetailedAttendance());
          }
        })
        .catch(() => {
          /* surfaced by enrollError below */
        });
    } else {
      dispatch(resetEnrollments());
      dispatch(resetAttendance());
      setSelectedSubjectId("");
      setSelectedDate(startOfDay(new Date()));
      dispatch(clearDetailedAttendance());
    }
    return () => {
      dispatch(clearEnrollmentError());
      dispatch(clearAttendanceError());
    };
  }, [dispatch, isAuthenticated, userId, selectedSubjectId]);

  useEffect(() => {
    if (isAuthenticated && userId && selectedSubjectId && selectedDate) {
      dispatch(
        fetchAttendanceRecords({
          userId,
          subjectId: selectedSubjectId,
          date: format(selectedDate, "yyyy-MM-dd"),
        })
      );
      dispatch(
        fetchAttendancePercentage({ userId, subjectId: selectedSubjectId })
      );
    } else {
      dispatch(clearDetailedAttendance());
    }
  }, [dispatch, isAuthenticated, userId, selectedSubjectId, selectedDate]);

  /* -------------------------------------------------------------- handlers */

  const handleSubjectChangeAndSelect = useCallback(
    (subjectId) => {
      const subjectIdStr = subjectId.toString();
      if (selectedSubjectId !== subjectIdStr) {
        setSelectedSubjectId(subjectIdStr);
        setSelectedDate(startOfDay(new Date()));
        dispatch(clearAttendanceError());
      }
    },
    [dispatch, selectedSubjectId]
  );

  const openAttendanceModal = useCallback(
    (mode, record = null, specificDate = null) => {
      const subject = selectedSubjectForDetails;
      if (!subject) {
        toast.error("Pick a subject first.");
        return;
      }
      if (!userId) {
        toast.error("You need to be signed in to mark attendance.");
        return;
      }

      let modalData;
      if (mode === "create") {
        const dateToUse =
          specificDate && isValid(specificDate)
            ? format(startOfDay(specificDate), "yyyy-MM-dd")
            : format(new Date(), "yyyy-MM-dd");
        modalData = {
          userId,
          subjectId: subject.id,
          subjectName: subject.name,
          date: dateToUse,
          status: "",
        };
      } else if (mode === "edit" && record) {
        let recordDateStr = record.date;
        try {
          if (isValid(parseISO(record.date))) {
            recordDateStr = format(parseISO(record.date), "yyyy-MM-dd");
          } else if (!/^\d{4}-\d{2}-\d{2}$/.test(record.date)) {
            throw new Error("Invalid date format");
          }
        } catch {
          toast.error("That record has an unreadable date.");
          return;
        }
        modalData = {
          userId,
          subjectId: subject.id,
          subjectName: subject.name,
          recordId: record.id,
          date: recordDateStr,
          status: record.status,
        };
      } else {
        toast.error("Could not open that record.");
        return;
      }
      setAttendanceModalState({ isOpen: true, mode, data: modalData });
    },
    [selectedSubjectForDetails, userId]
  );

  const closeAttendanceModal = useCallback(
    () => setAttendanceModalState({ isOpen: false, mode: "create", data: null }),
    []
  );
  const handleOpenEnrollModal = useCallback(() => setIsEnrollModalOpen(true), []);
  const closeEnrollmentModal = useCallback(() => setIsEnrollModalOpen(false), []);

  const handleUnenroll = useCallback(
    async (subjectIdToUnenroll) => {
      if (!userId || !subjectIdToUnenroll || unrollingSubjectId) return;
      const subject = userEnrollments.find((s) => s.id === subjectIdToUnenroll);
      if (
        !subject ||
        !window.confirm(
          `Unenroll from "${subject.name}"? This also removes its attendance records.`
        )
      )
        return;

      setUnrollingSubjectId(subjectIdToUnenroll);
      dispatch(clearEnrollmentError());
      try {
        await dispatch(
          unenrollFromSubject({ userId, subjectId: subjectIdToUnenroll })
        ).unwrap();
      } catch {
        /* the thunk raises its own toast */
      } finally {
        setUnrollingSubjectId(null);
      }
    },
    [dispatch, userId, userEnrollments, unrollingSubjectId]
  );

  /* ------------------------------------------------------- retry handlers */

  const handleRetryEnrollments = useCallback(() => {
    if (userId) {
      dispatch(clearEnrollmentError());
      dispatch(fetchUserEnrollments(userId));
    }
  }, [dispatch, userId]);

  const handleRetryOverall = useCallback(() => {
    if (userId) {
      dispatch(clearAttendanceError());
      dispatch(fetchOverallPercentage(userId));
    }
  }, [dispatch, userId]);

  const handleRetrySubjectWise = useCallback(() => {
    if (userId) {
      dispatch(clearAttendanceError());
      dispatch(fetchSubjectWisePercentages(userId));
    }
  }, [dispatch, userId]);

  const handleRetryDetailed = useCallback(() => {
    if (userId && selectedSubjectId && selectedDate) {
      dispatch(clearAttendanceError());
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      dispatch(
        fetchAttendanceRecords({
          userId,
          subjectId: selectedSubjectId,
          date: formattedDate,
        })
      );
      dispatch(
        fetchAttendancePercentage({ userId, subjectId: selectedSubjectId })
      );
    }
  }, [dispatch, userId, selectedSubjectId, selectedDate]);

  /* ---------------------------------------------------------------- render */

  const hasEnrollments = userEnrollments.length > 0;

  return (
    <PageShell width="wide">
      {/* Enroll button is wired up now. handleOpenEnrollModal was defined but
          passed to nothing, so the enrollment modal was unreachable. */}
      <AttendancePageHeader
        onEnrollMoreClick={handleOpenEnrollModal}
        enrollError={enrollError}
      />

      {enrollError && (
        <div className="mt-6">
          <ErrorDisplay
            error={enrollError}
            onRetry={handleRetryEnrollments}
            messagePrefix="Subjects: "
          />
        </div>
      )}

      {enrollLoading && !hasEnrollments && (
        <div className="mt-10 flex items-center gap-3 text-ink-3">
          <Spinner size="sm" />
          <span className="text-ui">Loading your subjects…</span>
        </div>
      )}

      {!enrollLoading && !hasEnrollments && !enrollError && (
        <div className="mt-10">
          <EmptyState
            icon={BookOpen}
            title="You are not enrolled in anything yet"
            description="Enroll in your subjects and attendance tracking starts from the next class you mark."
            action={
              <Button size="sm" onClick={handleOpenEnrollModal}>
                Enroll in subjects
              </Button>
            }
          />
        </div>
      )}

      {hasEnrollments && (
        <div className="mt-10 flex flex-col gap-10">
          <OverallSummaryCard
            errorOverall={errorOverall}
            onRetryOverall={handleRetryOverall}
            loadingOverall={loadingOverall}
            overallPercentageData={overallPercentageData}
          />

          <SubjectBreakdownSection
            errorSubjectPercentages={errorSubjectPercentages}
            onRetrySubjectWise={handleRetrySubjectWise}
            loadingSubjectPercentages={loadingSubjectPercentages}
            subjectPercentageList={subjectPercentageList}
            userEnrollments={userEnrollments}
            selectedSubjectId={selectedSubjectId}
            unrollingSubjectId={unrollingSubjectId}
            onSubjectSelect={handleSubjectChangeAndSelect}
            onUnenrollSubject={handleUnenroll}
            unenrollLoading={unenrollLoading}
          />

          {/* The detailed view. These three components existed but were never
              rendered — the page only ever showed a flat summary. */}
          {selectedSubjectForDetails ? (
            <section className="flex flex-col gap-6 border-t border-line pt-10">
              <DetailedViewControls
                selectedSubject={selectedSubjectForDetails}
                selectedDate={selectedDate}
                onDateChange={(date) => setSelectedDate(startOfDay(date))}
                onMarkTodayClick={() => openAttendanceModal("create")}
                maxDate={new Date()}
                isActionDisabled={isDetailedActionDisabled}
              />

              <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
                <DailyRecordsList
                  selectedDate={selectedDate}
                  attendError={attendError}
                  onRetryDetailed={handleRetryDetailed}
                  attendLoading={attendLoading}
                  records={records}
                  onEditRecordClick={openAttendanceModal}
                  onMarkThisDateClick={openAttendanceModal}
                  isActionDisabled={isDetailedActionDisabled}
                />

                <SubjectSummaryCard
                  errorPercentage={errorPercentage}
                  onRetryDetailed={handleRetryDetailed}
                  loadingPercentage={loadingPercentage}
                  percentageData={percentageData}
                />
              </div>
            </section>
          ) : (
            <div className="border-t border-line pt-10">
              <EmptyState
                title="Pick a subject"
                description="Select one above to see its day-by-day records and mark attendance."
              />
            </div>
          )}
        </div>
      )}

      <Suspense fallback={null}>
        {attendanceModalState.isOpen && (
          <AttendanceFormModal
            isOpen={attendanceModalState.isOpen}
            onClose={closeAttendanceModal}
            mode={attendanceModalState.mode}
            initialData={attendanceModalState.data}
          />
        )}
        {isEnrollModalOpen && (
          <EnrollmentModal
            isOpen={isEnrollModalOpen}
            onClose={closeEnrollmentModal}
          />
        )}
      </Suspense>
    </PageShell>
  );
};

export default AttendancePage;
