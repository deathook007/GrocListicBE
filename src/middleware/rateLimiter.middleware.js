import { rateLimit } from "express-rate-limit";

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message:
    "Too many login attempts from this IP. Please try again after 15 minutes.",
  statusCode: 429,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
