import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const shared = {
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  // Never rate-limit the automated test/dev harness against itself.
  skip: () => env.isTest,
  message: { error: 'Too many requests. Please try again shortly.' },
};

/** Broad ceiling for the whole API surface. */
export const apiLimiter = rateLimit({
  ...shared,
  windowMs: 60 * 1000,
  limit: 300,
});

/** Deliberately tight: the login endpoint is the highest-value target. */
export const loginLimiter = rateLimit({
  ...shared,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  message: { error: 'Too many sign-in attempts. Try again in a few minutes.' },
});

/** Caps public form spam without inconveniencing a genuine visitor. */
export const leadLimiter = rateLimit({
  ...shared,
  windowMs: 10 * 60 * 1000,
  limit: 5,
  message: { error: 'You have submitted several enquiries already. Please wait before sending another.' },
});

/** Beacons are frequent and cheap, so the ceiling is generous but finite. */
export const telemetryLimiter = rateLimit({
  ...shared,
  windowMs: 60 * 1000,
  limit: 120,
  message: { error: 'Telemetry rate exceeded.' },
});

/** Password and email changes are sensitive; throttle them independently. */
export const sensitiveLimiter = rateLimit({
  ...shared,
  windowMs: 15 * 60 * 1000,
  limit: 10,
});
