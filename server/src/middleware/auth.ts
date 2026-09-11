import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

interface JwtPayload {
  sub: string;
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return next(ApiError.unauthorized("Missing or malformed Authorization header."));
  }

  const token = header.slice("Bearer ".length).trim();

  try {
    const payload = jwt.verify(token, env.jwtSecret) as JwtPayload;
    if (!payload.sub) {
      return next(ApiError.unauthorized("Invalid token payload."));
    }
    req.userId = payload.sub;
    next();
  } catch {
    next(ApiError.unauthorized("Invalid or expired token."));
  }
}
