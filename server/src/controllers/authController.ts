import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User, SALT_ROUNDS } from "../models/User";
import { validateRegisterInput, validateLoginInput } from "../validators/authValidators";
import { ApiError } from "../utils/ApiError";
import { sendSuccess } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { env } from "../config/env";

function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as jwt.SignOptions);
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { valid, errors } = validateRegisterInput(req.body);
  if (!valid) {
    throw ApiError.badRequest(errors.join(" "));
  }

  const email = (req.body.email as string).trim().toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) {
    throw ApiError.conflict("An account with that email already exists.");
  }

  const passwordHash = await bcrypt.hash(req.body.password as string, SALT_ROUNDS);
  const user = await User.create({
    name: (req.body.name as string).trim(),
    email,
    passwordHash,
  });

  const token = signToken(user.id);
  sendSuccess(res, 201, { user: user.toJSON(), token });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { valid, errors } = validateLoginInput(req.body);
  if (!valid) {
    throw ApiError.badRequest(errors.join(" "));
  }

  const email = (req.body.email as string).trim().toLowerCase();
  const user = await User.findOne({ email }).select("+passwordHash");

  // Deliberately identical error for "no such user" and "wrong password" so
  // a caller can't use this endpoint to discover which emails are registered.
  const invalidCredentials = () => ApiError.unauthorized("Invalid email or password.");

  if (!user) {
    throw invalidCredentials();
  }

  const passwordMatches = await user.comparePassword(req.body.password as string);
  if (!passwordMatches) {
    throw invalidCredentials();
  }

  const token = signToken(user.id);
  sendSuccess(res, 200, { user: user.toJSON(), token });
});
