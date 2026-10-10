import React from "react";
import { Spinner } from "../components/ui";

/**
 * Kept as a thin wrapper so the ~12 existing call sites keep working. The old
 * version took raw Tailwind class strings as props (`size="text-4xl"`,
 * `color="text-amber-400"`), which is exactly the pattern the token layer
 * replaces — so those props are now ignored in favour of the ink ramp.
 */
const LoadingSpinner = ({ size = "lg", className }) => (
  <div className="flex items-center justify-center py-6 text-ink-3">
    <Spinner size={typeof size === "string" && size.startsWith("text-") ? "lg" : size} className={className} />
  </div>
);

export default LoadingSpinner;
