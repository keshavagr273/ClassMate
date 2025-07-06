// src/pages/AttendancePage.jsx
import React, { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { startOfDay } from "date-fns";
import toast from "react-hot-toast";
import { FiAlertTriangle, FiBookOpen, FiEdit2 } from "react-icons/fi";
import { MdMenuBook, MdAnalytics, MdEvent, MdEdit } from "react-icons/md";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// --- Redux Actions ---
import {
  fetchUserEnrollments,
  clearEnrollmentError,
  resetEnrollments,
  unenrollFromSubject,
} from "../../slices/enrollmentSlice"; // Adjust path
import {
  fetchAttendanceRecords,
  fetchAttendancePercentage,
  clearAttendanceError,
  resetAttendance,
  fetchOverallPercentage,
  fetchSubjectWisePercentages,
  clearDetailedAttendance,
} from "../../slices/attendanceSlice"; // Adjust path
import { format,isValid,parseISO } from "date-fns";
// --- Child Components ---
import AttendancePageHeader from "../../components/Attendance/AttendancePageHeader"; // Adjust path
import OverallSummaryCard from "../../components/Attendance/OverallSummaryCard"; // Adjust path
import SubjectBreakdownSection from "../../components/Attendance/SubjectBreakdownSection"; // Adjust path
import DetailedViewControls from "../../components/Attendance/DetailedViewControls"; // Adjust path
import SubjectSummaryCard from "../../components/Attendance/SubjectSummaryCard"; // Adjust path
import DailyRecordsList from "../../components/Attendance/DailyRecordsList"; // Adjust path
import LoadingSpinner from "../../utils/LoadingSpinner"; // Adjust path
import ErrorDisplay from "../../utils/ErrorDisplay"; // Adjust path
import SubjectHorizontalCard from "../../components/Attendance/SubjectHorizontalCard";

// --- Lazy Load Modals ---
const AttendanceFormModal = lazy(
  () => import("../../components/Modals/AttendanceFormModal") // Adjust path
);
const EnrollmentModal = lazy(
  () => import("../../components/Modals/EnrollmentModal") // Adjust path
);

const DEFAULT_SUBJECT_IMAGES = [
  // Add more URLs or use a function to randomize if desired
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDfUvFdOiFFEfYgbCcmIIFBn_CwffuxeKHz-uMEmNe3VEeAwDFgMCAo4Jo5y5X7TvTA7UHskrJjevPiVVisJ9mN9J4pcpVyvy5aAgX0mFrL4JCytIHSxmVbMxpDbTw2GeW76QuRZ2OU-bes3FoPgw6OyOkqH4s2kUWalp88MsdLZnr89n0rsKEmFyz9UMFtANykG_Y9tiD7e3aDy8trl-HxuZrAxZeaTVH3NIWmtH25bpnCr49wg77MnAMxkRKR74GPygfXgA3hMf8",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDaRga-PX6uwMdw7rtbrTzZENHaXPkvGd93hbewZ4GJ5MxYHgygz-t6crUwK5G-76C4fPTDMpl0sd8lXihUTbhuB4999iip80rd4PPS2YLqMbtP796MR4jQ55xS2om1YbcMRy9xqgnm1wfCdkvlQ2HBJzIfEvJ1TSmjjcRfGF3Pza1ALYkZfX2qDPn0rngjjFzTL3Y_V9FZ3oo6nsOI9Y4E5XC2VCz-Lw5gZv5AvDvFc79xdWPGTvBwWmSst3Li-zK76Wu7AXp7Y1U",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDp3hQhLPl87u8u3t0yUdFvTPRf-BaG0YL0fc3S8sDai_hIm4R3qCVkxvBHNWI32Sb2dF2ftIwRVTdVct4uLPab5uBKQx85J4N9G9mQFH7TxX1ePWaALYG0xfWXtMaEoYyhcjXWidjvdQoFkFHUXh4oNL7RVJxCWuLzSyZ-Sx0H90ZB89Dr6l44gwL8RbEWhm2E8s1-GiBiGz9p-asOJf85m4VusOTBPwzli5HqDW9Y_Q5fm_mOmVsu_enB1OzWcOTK-1c0S7mTKvk",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBhvhzyzQ_ph11ew3I_6TxsPGzHWVTwADCUTxdm40vxk_nDAvKiVJc2sJA_OhsUnN6rjILDQjgOmrR-7HnskF_WE05k9e4o3XEtwjP4NJEZsKZ4SlVkPYmUFr_zH_50P1m8aMekv671vOkIv5ZkG8CqQ_kOF_HmhhUYZhLhhRb7nBW-db_YMgN4Hen9TrZIgvejtOVQrKlU4a-x2Q8BTw_GwfLQT-Hywc6XrpCUfp1NgWJlFF_X9j6NNhJVoBz8j0VRLY2MDis2DkQ"
];

// --- Main AttendancePage Component ---
const AttendancePage = () => {
  // Hooks
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // State Selection from Redux
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
    loading: attendLoading, // Loading detailed records or marking/updating
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

  // Local Component State
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [attendanceModalState, setAttendanceModalState] = useState({
    isOpen: false,
    mode: "create",
    data: null,
  });
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [unrollingSubjectId, setUnrollingSubjectId] = useState(null);

  // --- Derived State ---
  const userId = user?.id;
  const selectedSubjectForDetails = userEnrollments.find(
    (s) => s.id === parseInt(selectedSubjectId, 10)
  );
  const isDetailedActionDisabled = attendLoading || attendanceModalState.isOpen; // Combine loading/modal open state

  // Consistent theme styles (can be moved to a context or config if needed)
  const themeStyles = {
    cardBg: "bg-gray-800/40",
    borderColor: "border-gray-700/50",
    headingColor: "text-amber-400",
    buttonGradient: "from-amber-500 to-orange-600",
    modalBg: "bg-gray-900",
    listHoverBg: "hover:bg-gray-700/50",
    tagBg: "bg-amber-500/20",
    tagText: "text-amber-400",
  };

  // --- Data Fetching Effects ---
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
        .catch((err) =>
          console.error("Failed to fetch initial enrollments:", err)
        );
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
    if (userId && selectedSubjectId && selectedDate) {
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      const filters = {
        userId,
        subjectId: selectedSubjectId,
        date: formattedDate,
      };
      dispatch(fetchAttendanceRecords(filters));
      dispatch(
        fetchAttendancePercentage({ userId, subjectId: selectedSubjectId })
      );
    } else {
      dispatch(clearDetailedAttendance());
    }
  }, [dispatch, userId, selectedSubjectId, selectedDate]);

  // --- Event Handlers (Callbacks for Child Components) ---
  const handleSubjectChangeAndSelect = useCallback(
    (subjectId) => {
      const subjectIdStr = subjectId.toString();
      if (selectedSubjectId !== subjectIdStr) {
        setSelectedSubjectId(subjectIdStr);
        setSelectedDate(startOfDay(new Date()));
        dispatch(clearAttendanceError()); // Clear only detailed errors
      }
    },
    [dispatch, selectedSubjectId]
  );

  const openAttendanceModal = useCallback(
    (mode, record = null, specificDate = null) => {
      const subject = selectedSubjectForDetails;
      if (!subject || !userId) {
        toast.error("Cannot open modal - user or subject missing.");
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
        // Attempt formatting robustly
        try {
          if (isValid(parseISO(record.date))) {
            recordDateStr = format(parseISO(record.date), "yyyy-MM-dd");
          } else if (!/^\d{4}-\d{2}-\d{2}$/.test(record.date)) {
            throw new Error("Invalid date format");
          }
          // If already YYYY-MM-DD, use as is
        } catch (error) {
          toast.error("Invalid record date format for editing.");
          console.error("Date parsing error:", error);
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
        toast.error("Invalid modal configuration.");
        return;
      }
      setAttendanceModalState({ isOpen: true, mode, data: modalData });
    },
    [selectedSubjectForDetails, userId]
  );

  const closeAttendanceModal = useCallback(
    () =>
      setAttendanceModalState({ isOpen: false, mode: "create", data: null }),
    []
  );
  const handleOpenEnrollModal = useCallback(
    () => setIsEnrollModalOpen(true),
    []
  );
  const closeEnrollmentModal = useCallback(
    () => setIsEnrollModalOpen(false),
    []
  );

  const handleUnenroll = useCallback(
    async (subjectIdToUnenroll) => {
      if (!userId || !subjectIdToUnenroll || unrollingSubjectId) return;
      const subject = userEnrollments.find((s) => s.id === subjectIdToUnenroll);
      if (
        !subject ||
        !window.confirm(
          `Unenroll from "${subject.name}"? This removes related attendance data.`
        )
      )
        return;

      setUnrollingSubjectId(subjectIdToUnenroll);
      dispatch(clearEnrollmentError());
      try {
        await dispatch(
          unenrollFromSubject({ userId, subjectId: subjectIdToUnenroll })
        ).unwrap();
        // Success toast/refetch handled in thunk/useEffect
      } catch (err) {
        // Error toast handled in thunk
        console.error("Unenrollment failed in component:", err);
      } finally {
        setUnrollingSubjectId(null);
      }
    },
    [dispatch, userId, userEnrollments, unrollingSubjectId]
  );

  // --- Retry Handlers ---
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

  // --- Render Logic ---

  // Always render NavBar at the top
  return (
    <div className="bg-gradient-to-tr from-gray-900 via-black to-gray-900 text-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Attendance Dashboard</h1>
          <p className="text-sm text-gray-400">Track your attendance across all your subjects.</p>
        </div>
        {/* Subject Overview */}
        <div className="bg-[#121926] rounded-xl shadow-lg p-6 flex flex-col sm:flex-row justify-between items-center mb-8">
          <div>
            <h2 className="text-md font-semibold text-white">Subject Overview</h2>
            <p className="text-sm mt-2 text-gray-300">{selectedSubjectForDetails?.name}<br /><span className="text-xs text-gray-500">Attendance Rate: {percentageData ? percentageData.percentage.toFixed(1) : '0.0'}%</span></p>
            <button className="mt-3 bg-white text-black px-4 py-2 rounded-md font-semibold hover:bg-gray-200 transition">View Details</button>
          </div>
          <div>
            <img src="https://assets-global.website-files.com/62a8b2e9ab1c7d7a2e9e7a5f/637a5a53bb97a1f7ea1d9c8c_Read-Book.png" className="w-32 rounded-md mt-6 sm:mt-0" alt="Book" />
          </div>
        </div>
        {/* Add Attendance Button */}
        <div className="flex justify-end mb-6">
          <button className="bg-sky-200 text-black font-semibold px-5 py-2 rounded-md shadow hover:bg-sky-300 transition" onClick={() => selectedSubjectId && openAttendanceModal("create", null, new Date())} disabled={!selectedSubjectId}>Add Attendance</button>
        </div>
        {/* Divider */}
        <hr className="border-gray-800 mb-6" />
        {/* Selection Area */}
        <div className="bg-[#121926] rounded-xl p-5 flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-400">Subject Selected:</p>
            <p className="font-semibold text-white">{selectedSubjectForDetails?.name} <span className="text-xs text-gray-500">({selectedSubjectForDetails?.code})</span></p>
          </div>
          <div className="flex items-center gap-4">
            <DatePicker
              selected={selectedDate}
              onChange={date => setSelectedDate(date)}
              dateFormat="yyyy-MM-dd"
              maxDate={new Date()}
              className="bg-gray-900 text-gray-300 border border-gray-700 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 w-[150px] text-center cursor-pointer"
              popperPlacement="bottom-start"
            />
            <button className="bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-2 rounded-md transition" onClick={() => openAttendanceModal('create', null, selectedDate)} disabled={isDetailedActionDisabled}>Mark Attendance</button>
          </div>
        </div>
        {/* Attendance Summary & Records */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Attendance Summary */}
          <div className="bg-[#121926] rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <MdAnalytics className="text-amber-400 text-2xl" />
              <h3 className="text-xl font-semibold text-white">Summary</h3>
            </div>
            <p className="text-sm text-gray-300 mb-2">Current Attendance Rate:</p>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-full h-3 bg-gray-700 rounded-full">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${percentageData ? percentageData.percentage : 0}%` }}></div>
              </div>
              <span className="text-green-400 font-semibold text-sm">{percentageData ? percentageData.percentage.toFixed(1) : '0.0'}%</span>
            </div>
            <ul className="text-sm space-y-1">
              <li>✅ <span className="text-gray-300">Classes Attended:</span> <span className="text-green-400 font-bold">{percentageData ? percentageData.presentDays : 0}</span></li>
              <li>❌ <span className="text-gray-300">Classes Missed:</span> <span className="text-red-400 font-bold">{percentageData ? percentageData.absentDays : 0}</span></li>
              <li>📊 <span className="text-gray-300">Total Classes Marked:</span> <span className="text-blue-400 font-bold">{percentageData ? percentageData.totalDays : 0}</span></li>
            </ul>
          </div>
          {/* Attendance Record */}
          <div className="bg-[#121926] rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <MdEvent className="text-yellow-400 text-2xl" />
              <h3 className="text-xl font-semibold text-white">Attendance Record:</h3>
              <span className="ml-auto bg-sky-200 text-sky-800 font-bold text-sm px-3 py-1 rounded-lg">{selectedDate ? format(selectedDate, 'eeee, MMMM d, yyyy') : ''}</span>
            </div>
            {records.length > 0 ? (
              records.map(record => (
                <div key={record.id} className="flex items-center justify-between bg-gray-900 border border-gray-700 px-4 py-3 rounded-lg text-sm text-white mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${record.status === 'Present' ? 'bg-green-700 text-white' : 'bg-red-700 text-white'}`}>{record.status}</span>
                  <p className="text-gray-400">Marked at {record.markedAt ? format(new Date(record.markedAt), 'HH:mm') : ''}</p>
                  <button title="Edit" onClick={() => openAttendanceModal('edit', record)}><MdEdit className="text-gray-400 hover:text-white" /></button>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-center py-6">No attendance has been recorded for this subject on the selected date.</div>
            )}
          </div>
        </div>
      </div>
      {/* Modals */}
      <Suspense fallback={<LoadingSpinner />}> 
        {attendanceModalState.isOpen && (
          <AttendanceFormModal
            isOpen={attendanceModalState.isOpen}
            onClose={closeAttendanceModal}
            mode={attendanceModalState.mode}
            initialData={attendanceModalState.data}
            themeStyles={themeStyles}
          />
        )}
        {isEnrollModalOpen && (
          <EnrollmentModal
            isOpen={isEnrollModalOpen}
            onClose={closeEnrollmentModal}
            themeStyles={themeStyles}
          />
        )}
      </Suspense>
    </div>
  );
};

export default AttendancePage;
