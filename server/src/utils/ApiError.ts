/**
 * An error that is safe to surface to the client as-is (its `message` is
 * shown verbatim). Anything thrown that is NOT an ApiError is treated as an
 * unexpected internal error and hidden behind a generic 500 message instead.
 */
export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ApiError";
    Error.captureStackTrace?.(this, ApiError);
  }

  static badRequest(message: string): ApiError {
    return new ApiError(400, message);
  }

  static unauthorized(message = "Unauthorized"): ApiError {
    return new ApiError(401, message);
  }

  static forbidden(message = "Forbidden"): ApiError {
    return new ApiError(403, message);
  }

  static notFound(message = "Not found"): ApiError {
    return new ApiError(404, message);
  }

  static conflict(message: string): ApiError {
    return new ApiError(409, message);
  }
}
