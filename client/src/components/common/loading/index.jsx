import React, { useEffect, useState } from "react";
import { ProgressBar } from "../../ui";

const messageFor = (progress) => {
  if (progress < 30) return "Connecting to the database";
  if (progress < 60) return "Starting up";
  if (progress < 90) return "Loading your data";
  return "Almost ready";
};

/**
 * Full-screen boot gate. Previously this injected a raw <style> tag with its
 * own keyframes and hardcoded #151a1e / #333, entirely outside the token
 * layer, and derived its message from a second interval that read a stale
 * `progress` from its closure — so the message never advanced. The message is
 * now derived from progress directly, which removes the second timer.
 */
const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // Hold at 90% until the real auth/health check resolves.
      setProgress((prev) => (prev >= 90 ? prev : prev + 10));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-canvas px-6"
    >
      <div className="grain" aria-hidden />

      <div className="flex w-full max-w-xs flex-col items-start gap-5">
        <p className="font-display text-h3 font-bold tracking-tight text-ink">
          ClassMate
        </p>

        <div className="w-full">
          <ProgressBar value={progress} tone="ink" />
          <div className="mt-3 flex items-baseline justify-between gap-4">
            <p className="text-meta text-ink-3">{messageFor(progress)}</p>
            <span className="numeric text-micro text-ink-4">{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
