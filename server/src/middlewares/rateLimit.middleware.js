import rateLimit from "express-rate-limit";

/**
 * express-rate-limit was already a dependency but was never wired up, so the
 * login endpoint accepted unlimited password guesses and the internship
 * scrape — a 3-minute third-party call — could be triggered in a loop by
 * anyone, authenticated or not.
 */

const message = (text) => ({
  status: "error",
  success: false,
  data: null,
  message: text,
});

/** Sign-in and sign-up. Tight, because this is the brute-force surface. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  // Only failed attempts count, so a legitimate user signing in repeatedly
  // from a shared campus NAT is not locked out.
  skipSuccessfulRequests: true,
  message: message(
    "Too many sign-in attempts. Please wait a few minutes and try again."
  ),
});

/** The internship scrape: expensive, slow, and hits a third-party API. */
export const scrapeLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 8,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: message(
    "Too many job searches. Please wait a few minutes and try again."
  ),
});

/** Everything else, as a blanket backstop against runaway clients. */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: message("Too many requests. Please slow down."),
});

export default apiLimiter;
