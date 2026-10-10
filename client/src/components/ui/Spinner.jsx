import React from "react";
import { cn } from "./cn";

const sizes = {
  xs: "size-3.5 border",
  sm: "size-4 border",
  md: "size-5 border-2",
  lg: "size-8 border-2",
  xl: "size-10 border-2",
};

/**
 * The single spinner in the app. Replaces four hand-written `animate-spin`
 * SVGs, a react-loader-spinner TailSpin, and a raw-CSS loader.
 */
const Spinner = ({ size = "md", className, label = "Loading" }) => (
  <span
    role="status"
    aria-label={label}
    className={cn(
      "inline-block shrink-0 animate-spin rounded-full",
      "border-current border-r-transparent opacity-70",
      sizes[size] || sizes.md,
      className
    )}
  />
);

export default Spinner;
