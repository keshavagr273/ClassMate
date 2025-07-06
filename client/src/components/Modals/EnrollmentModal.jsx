import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import Modal from "react-modal";
import {
  FiX,
  FiSave,
  FiLoader,
  FiAlertCircle,
  FiSearch,
  FiCheckSquare,
  FiSquare,
} from "react-icons/fi";
import { MdClose, MdSearch, MdLock } from "react-icons/md";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { enrollInSubject, clearEnrollmentError } from "../../slices/enrollmentSlice";
import { fetchSubjects, clearResourcesError } from "../../features/resource";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    background: "transparent",
    border: "none",
    padding: 0,
    overflow: "visible",
    maxWidth: "95vw",
    width: "600px",
    maxHeight: "85vh",
    display: 'flex',
    flexDirection: 'column',
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    zIndex: 50,
  },
};

Modal.setAppElement("#root");

const EnrollmentModal = ({ isOpen, onClose, themeStyles = {} }) => {
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
  const enrolledSubjectIds = useMemo(() => new Set(userEnrollments.map(s => s.id)), [userEnrollments]);

  const filteredSubjects = useMemo(() => {
    if (!availableSubjects) return [];
    const lowerSearchTerm = searchTerm.toLowerCase();
    return availableSubjects.filter(
      (subject) =>
        subject.name.toLowerCase().includes(lowerSearchTerm) ||
        subject.code.toLowerCase().includes(lowerSearchTerm)
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
      const newSet = new Set(prev);
      if (newSet.has(subjectId)) {
        newSet.delete(subjectId);
      } else {
        newSet.add(subjectId);
      }
      return newSet;
    });
  };

  const handleEnroll = useCallback(async () => {
    if (!userId || selectedSubjectIds.size === 0) return;

    const subjectsToEnroll = Array.from(selectedSubjectIds);
    const enrollPromises = subjectsToEnroll.map((subjectId) =>
      dispatch(enrollInSubject({ userId, subjectId })).unwrap()
    );

    const results = await Promise.allSettled(enrollPromises);

    let successCount = 0;
    let failureCount = 0;
    results.forEach(result => {
        if (result.status === 'fulfilled') {
            successCount++;
        } else {
            failureCount++;
            console.error("Enrollment failed for a subject:", result.reason);
        }
    });

    if(successCount > 0) {
        toast.success(`Successfully enrolled in ${successCount} subject(s).`);
    }
    if(failureCount > 0) {
        toast.error(`Failed to enroll in ${failureCount} subject(s). Check console or previous messages.`);
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

  return (
    isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-gray-900 text-gray-200 w-full max-w-md rounded-xl shadow-xl p-6 relative">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition"
            aria-label="Close modal"
          >
            <MdClose className="text-2xl" />
          </button>

          {/* Title */}
          <h2 className="text-xl font-semibold text-amber-400 mb-4">Add Your Subjects</h2>

          {/* Search Box */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search subjects by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <MdSearch className="absolute right-3 top-2.5 text-gray-400 text-xl" />
          </div>

          {/* Empty Message or Subject List */}
          {subjectsLoading && !filteredSubjects.length ? (
            <div className="flex justify-center items-center h-24">
              <FiLoader className="animate-spin text-amber-400 text-3xl" />
            </div>
          ) : !subjectsLoading && !filteredSubjects.length && !subjectsError ? (
            <div className="text-center text-gray-500 text-sm py-6">
              No subjects available to enroll.
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-56 overflow-y-auto mb-2">
              {filteredSubjects.map((subject) => {
                const isSelected = selectedSubjectIds.has(subject.id);
                const isAlreadyEnrolled = enrolledSubjectIds.has(subject.id);
                return (
                  <div
                    key={subject.id}
                    onClick={() => !isAlreadyEnrolled && handleSubjectToggle(subject.id)}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                      isAlreadyEnrolled
                        ? 'bg-gray-700/30 border-gray-600 opacity-60 cursor-not-allowed'
                        : isSelected
                        ? 'bg-amber-800/30 border-amber-600'
                        : 'bg-gray-800/40 border-gray-700/50 hover:bg-gray-700/50 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center">
                      {isAlreadyEnrolled ? (
                        <FiCheckSquare className="mr-3 text-green-500 text-xl flex-shrink-0" title="Already Enrolled" />
                      ) : isSelected ? (
                        <FiCheckSquare className="mr-3 text-amber-400 text-xl flex-shrink-0" />
                      ) : (
                        <FiSquare className="mr-3 text-gray-500 text-xl flex-shrink-0" />
                      )}
                      <div>
                        <p className={`font-medium ${isAlreadyEnrolled ? 'text-gray-400' : 'text-gray-100'}`}>{subject.name}</p>
                        <p className="text-xs text-gray-400">{subject.code} {isAlreadyEnrolled ? '(Already Enrolled)' : ''}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Enroll Button */}
          <div className="mt-4 text-right">
            <button
              type="button"
              onClick={handleEnroll}
              disabled={enrollLoading || subjectsLoading || selectedSubjectIds.size === 0}
              className={`bg-gray-700 text-gray-400 px-5 py-2 rounded-full font-medium text-sm flex items-center gap-2 ${
                enrollLoading || subjectsLoading || selectedSubjectIds.size === 0
                  ? 'cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg transition duration-300 ease-in-out transform hover:scale-105'
              }`}
            >
              {enrollLoading ? (
                <FiLoader className="animate-spin text-base" />
              ) : (
                <MdLock className="text-base" />
              )}
              Add Selected ({selectedSubjectIds.size})
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default EnrollmentModal;
