import { Request, Response, NextFunction } from "express-serve-static-core";
import { HTTPException } from "../exceptions/root";

export function errorMiddleware(
  err: HTTPException,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log("Error!!");
  res.status(err.statusCode).json({
    message: err.message,
    errorCode: err.errorCode,
    errors: err.errors,
  });
}
