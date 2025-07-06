import React, { useState, useMemo } from "react";
import {
  FiEdit,
  FiTrash2,
  FiCalendar,
  FiClock,
  FiChevronDown,
  FiUser,
} from "react-icons/fi";

// Date formatter
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Invalid Date";
  }
};

const UserCard = React.memo(({ user }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const createdAtFormatted = useMemo(() => formatDate(user?.createdAt), [user?.createdAt]);
  const updatedAtFormatted = useMemo(() => formatDate(user?.updatedAt), [user?.updatedAt]);

  if (!user) return null;

  const avatarInitial = user.username?.charAt(0).toUpperCase() || "U";
  const displayName = user.name || "Anonymous";

  return (
    <div
      className={`bg-gradient-to-br from-[#1a1f2e] to-[#2e3445] backdrop-blur-md text-white rounded-2xl border border-gray-700 shadow-2xl p-6 transition-transform duration-300 ${
        isExpanded ? "scale-[1.015]" : "hover:scale-105"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <div className="w-14 h-14 bg-gradient-to-tr from-cyan-400 to-blue-500 text-gray-900 font-extrabold text-xl rounded-full flex items-center justify-center shadow-lg">
            {avatarInitial}
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-white">{displayName}</h3>
            <p className="text-sm text-gray-400 truncate max-w-[180px]">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-cyan-400 p-2 rounded-full transition"
          aria-label="Toggle expand"
        >
          <FiChevronDown
            className={`w-6 h-6 transform transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Roles */}
      {user.roles?.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-4">
          {user.roles.map((role) => (
            <span
              key={role}
              className="text-xs bg-cyan-900/30 border border-cyan-700/50 text-cyan-300 px-3 py-1 rounded-full font-medium"
            >
              {role}
            </span>
          ))}
        </div>
      )}

      {/* Expandable Details */}
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mt-4 pt-4 border-t border-gray-700 space-y-4 text-sm">
          <div className="flex items-center text-gray-300">
            <FiUser className="text-cyan-400 mr-2" />
            <span className="w-24 text-gray-400 font-medium">User ID:</span>
            <span className="font-mono bg-gray-900 px-2 py-1 rounded">{user.id}</span>
          </div>

          <div className="flex items-center text-gray-300">
            <FiCalendar className="text-cyan-400 mr-2" />
            <span className="w-24 text-gray-400 font-medium">Created:</span>
            <span>{createdAtFormatted}</span>
          </div>

          <div className="flex items-center text-gray-300">
            <FiClock className="text-cyan-400 mr-2" />
            <span className="w-24 text-gray-400 font-medium">Updated:</span>
            <span>{updatedAtFormatted}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          <button
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg transition font-medium shadow-md"
            aria-label="Edit User"
          >
            <FiEdit className="h-4 w-4" />
            Edit
          </button>
          <button
            className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg transition font-medium shadow-md"
            aria-label="Delete User"
          >
            <FiTrash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
});

export default UserCard;
