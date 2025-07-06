import React from "react";

const SubjectHorizontalCard = ({
  subjectName,
  attendanceRate,
  imageUrl,
  onViewDetails,
  isLoading,
}) => {
  return (
    <div className="flex items-stretch justify-between gap-4 rounded-xl bg-[#1f262e] p-4 shadow-[0_0_4px_rgba(0,0,0,0.1)] mb-6">
      <div className="flex flex-[2_2_0px] flex-col gap-4 justify-center">
        <div className="flex flex-col gap-1">
          <p className="text-white text-base font-bold leading-tight truncate" title={subjectName}>
            {subjectName}
          </p>
          <p className="text-[#9eadbd] text-sm font-normal leading-normal">
            Attendance Rate: {isLoading ? <span className="animate-pulse">...</span> : attendanceRate}
          </p>
        </div>
        <button
          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 px-4 flex-row-reverse bg-[#2b3640] text-white text-sm font-medium leading-normal w-fit"
          onClick={onViewDetails}
          aria-label="View Subject Details"
        >
          <span className="truncate">View Details</span>
        </button>
      </div>
      <div
        className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl flex-1 min-w-[120px] max-w-[220px]"
        style={{ backgroundImage: `url('${imageUrl}')` }}
      ></div>
    </div>
  );
};

export default SubjectHorizontalCard; 