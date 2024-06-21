import { Request, Response, NextFunction } from "express-serve-static-core";
import { ErrorCode, HTTPException } from "../exceptions/root";
import { InternalException } from "../exceptions/internal-exception";

type RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response>;

export function asyncHandler(requestHandler: RequestHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(requestHandler(req, res, next)).catch((error) => {
      let exception: HTTPException;
      if (error instanceof HTTPException) {
        exception = error;
      } else {
        exception = new InternalException(
          "Something went wrong",
          error,
          ErrorCode.INTERNAL_EXCEPTION
        );
      }
      next(exception);
    });
  };
}
