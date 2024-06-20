import { Request, Response, NextFunction } from "express-serve-static-core";

type RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response>;

export function asyncHandler(requestHandler: RequestHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
}
