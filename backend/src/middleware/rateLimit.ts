import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

interface LimiterOptions {
  windowMs: number; // length of the time window
  limit: number; // how many requests one IP address may make in that window
  skipSuccessfulRequests?: boolean; // true = only count failed requests (status 400 and above)
  enabled?: boolean; // limiters are off in tests so they don't interfere with unrelated tests
}

export function createLimiter({
  windowMs,
  limit,
  skipSuccessfulRequests = false,
  enabled = env.NODE_ENV !== "test",
}: LimiterOptions) {
  return rateLimit({
    windowMs,
    limit,
    skipSuccessfulRequests,
    standardHeaders: "draft-7", // adds RateLimit-* headers and Retry-After
    legacyHeaders: false,
    skip: () => !enabled,
    message: { message: "Too many attempts. Please try again later." }, // same shape as our other errors
  });
}

// 10 failed logins per 15 minutes per IP. Successful logins are not counted.
export const loginLimiter = createLimiter({ windowMs: 15 * 60 * 1000, limit: 10, skipSuccessfulRequests: true });

// 10 signups per hour per IP.
export const signupLimiter = createLimiter({ windowMs: 60 * 60 * 1000, limit: 10 });