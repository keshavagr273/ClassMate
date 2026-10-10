import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Button } from "../components/ui";

/**
 * Inline error strip. Used across the attendance tree and the rides pages.
 * Accepts either `message` or the older `error` + `messagePrefix` pair, since
 * the attendance components call it the second way.
 */
const ErrorDisplay = ({
  message,
  error,
  messagePrefix = "",
  onRetry,
  className = "",
}) => {
  const raw = message ?? error;
  const text =
    typeof raw === "string" ? raw : raw?.message || (raw ? String(raw) : "");
  if (!text) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      role="alert"
      className={`flex flex-col gap-3 rounded-card border border-clay/30 bg-clay-faint px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div className="flex items-start gap-2.5">
        <AlertTriangle
          className="mt-0.5 size-4 shrink-0 text-clay-soft"
          aria-hidden
        />
        <p className="text-meta text-ink-2">
          {messagePrefix}
          {text}
        </p>
      </div>

      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="self-start sm:self-auto">
          Try again
        </Button>
      )}
    </motion.div>
  );
};

export default ErrorDisplay;
