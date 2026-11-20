import type { RequestHandler } from "express";
import { AuthError } from "./errors.js";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export function createRateLimiter(
  limit: number,
  windowMs: number,
): RequestHandler {
  const entries = new Map<string, RateLimitEntry>();

  return (request, _response, next) => {
    const now = Date.now();
    const key = request.ip ?? "unknown";
    let entry = entries.get(key);

    if (!entry && entries.size >= 10_000) {
      for (const [entryKey, value] of entries) {
        if (value.resetAt <= now) {
          entries.delete(entryKey);
        }
      }
      if (entries.size >= 10_000) {
        next(
          new AuthError(
            429,
            "RATE_LIMITED",
            "Too many attempts. Try again later.",
          ),
        );
        return;
      }
    }

    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      entries.set(key, entry);
    }

    entry.count += 1;
    if (entry.count > limit) {
      next(
        new AuthError(
          429,
          "RATE_LIMITED",
          "Too many attempts. Try again later.",
        ),
      );
      return;
    }

    next();
  };
}
