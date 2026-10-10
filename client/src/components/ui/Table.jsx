import React from "react";
import { cn } from "./cn";

/**
 * Tables that read as tables: hairline rows, no zebra striping, tabular
 * numerals (applied globally to th/td in index.css), and a sticky header.
 */
export const Table = ({ className, containerClassName, children, ...props }) => (
  <div
    className={cn(
      "w-full overflow-x-auto rounded-card border border-line",
      containerClassName
    )}
  >
    <table className={cn("w-full border-collapse text-left", className)} {...props}>
      {children}
    </table>
  </div>
);

export const THead = ({ className, children, ...props }) => (
  <thead
    className={cn("sticky top-0 z-10 bg-surface-2", className)}
    {...props}
  >
    {children}
  </thead>
);

export const TBody = ({ className, children, ...props }) => (
  <tbody className={className} {...props}>
    {children}
  </tbody>
);

export const TR = ({ className, interactive = false, children, ...props }) => (
  <tr
    className={cn(
      "border-b border-line last:border-0",
      interactive && "transition-colors duration-150 hover:bg-surface-2",
      className
    )}
    {...props}
  >
    {children}
  </tr>
);

export const TH = ({ className, children, ...props }) => (
  <th
    scope="col"
    className={cn(
      "border-b border-line px-4 py-3 text-eyebrow uppercase text-ink-4 whitespace-nowrap",
      className
    )}
    {...props}
  >
    {children}
  </th>
);

export const TD = ({ className, children, ...props }) => (
  <td className={cn("px-4 py-3.5 text-ui text-ink-2 align-middle", className)} {...props}>
    {children}
  </td>
);

export default Table;
