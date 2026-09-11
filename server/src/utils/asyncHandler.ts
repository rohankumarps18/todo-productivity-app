import type { NextFunction, Request, Response } from "express";

type AsyncRouteHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/**
 * Express doesn't forward rejected promises from async handlers to error
 * middleware on its own. Wrapping every controller in this once means we
 * never need a try/catch block in the controllers themselves.
 */
export function asyncHandler(fn: AsyncRouteHandler) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}
