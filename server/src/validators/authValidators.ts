const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface RegisterInput {
  name?: unknown;
  email?: unknown;
  password?: unknown;
  confirmPassword?: unknown;
}

export function validateRegisterInput(body: RegisterInput): ValidationResult {
  const errors: string[] = [];

  if (typeof body.name !== "string" || body.name.trim().length === 0) {
    errors.push("Name is required.");
  }

  if (typeof body.email !== "string" || !EMAIL_RE.test(body.email.trim())) {
    errors.push("A valid email is required.");
  }

  if (typeof body.password !== "string" || body.password.length < 8) {
    errors.push("Password must be at least 8 characters.");
  }

  if (body.confirmPassword !== body.password) {
    errors.push("Password and confirm password do not match.");
  }

  return { valid: errors.length === 0, errors };
}

export interface LoginInput {
  email?: unknown;
  password?: unknown;
}

export function validateLoginInput(body: LoginInput): ValidationResult {
  const errors: string[] = [];

  if (typeof body.email !== "string" || body.email.trim().length === 0) {
    errors.push("Email is required.");
  }

  if (typeof body.password !== "string" || body.password.length === 0) {
    errors.push("Password is required.");
  }

  return { valid: errors.length === 0, errors };
}
