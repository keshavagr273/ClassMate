import React from "react";
import { cn } from "./cn";

const widths = {
  narrow: "max-w-2xl",
  default: "max-w-5xl",
  wide: "max-w-6xl",
  full: "max-w-[1400px]",
};

/**
 * The one page container. Replaces the copy-pasted Figma-export scaffold
 * (`layout-container` / `px-40` / `max-w-[960px]`) that sat on six pages, where
 * `layout-container` resolved to nothing and `px-40` broke every layout below
 * about 1100px.
 */
const PageShell = ({
  width = "default",
  className,
  innerClassName,
  children,
  ...props
}) => (
  <div
    className={cn("w-full px-5 py-10 sm:px-8 md:py-14 lg:px-10", className)}
    {...props}
  >
    <div className={cn("mx-auto w-full", widths[width] || widths.default, innerClassName)}>
      {children}
    </div>
  </div>
);

export default PageShell;
