import React from "react";
import { cn } from "./cn";

/** Loading placeholder. Nothing in the app had one before. */
const Skeleton = ({ className, ...props }) => (
  <div
    aria-hidden
    className={cn("animate-pulse rounded-chip bg-surface-3", className)}
    {...props}
  />
);

export const SkeletonText = ({ lines = 3, className }) => (
  <div className={cn("flex flex-col gap-2", className)} aria-hidden>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className={cn("h-3", i === lines - 1 ? "w-2/5" : i % 2 ? "w-4/5" : "w-full")}
      />
    ))}
  </div>
);

export const SkeletonCard = ({ className }) => (
  <div
    className={cn("rounded-card border border-line bg-surface p-5", className)}
    aria-hidden
  >
    <Skeleton className="h-4 w-1/3" />
    <SkeletonText lines={2} className="mt-4" />
    <Skeleton className="mt-5 h-8 w-24 rounded-full" />
  </div>
);

export default Skeleton;
