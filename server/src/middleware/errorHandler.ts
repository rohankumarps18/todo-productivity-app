import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { env } from "../config/env";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

/**
 * Single place all errors funnel through. Known ApiErrors surface their
 * message and status code as-is. Anything else (a MongoDB error, a bug, an
 * unhandled edge case) is logged server-side and shown to the client as a
 * generic 500 - we never leak internal error details or stack traces to
 * the API response.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }

  // Mongoose duplicate key error (e.g. email already registered when the
  // unique index catches a race condition the controller-level check missed).
  if (isMongoDuplicateKeyError(err)) {
    res.status(409).json({ success: false, message: "A record with that value already exists." });
    return;
  }

  // Mongoose validation error.
  if (err instanceof Error && err.name === "ValidationError") {
    res.status(400).json({ success: false, message: err.message });
    return;
  }

  if (!env.isTest) {
    // eslint-disable-next-line no-console
    console.error("Unhandled error:", err);
  }

  res.status(500).json({ success: false, message: "Internal server error." });
}

function isMongoDuplicateKeyError(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: number }).code === 11000;
}
