import { Request, Response, NextFunction } from "express-serve-static-core";
import { ZodError, ZodSchema } from "zod";
import { UnprocessableEntity } from "../exceptions/validation";
import { ErrorCode } from "../exceptions/root";
import { InternalException } from "../exceptions/internal-exception";

function validateRequest(schema: ZodSchema) {
  return function (req: Request, res: Response, next: NextFunction) {
    try {
      req.body = schema.parse(req.body);
      return next();
    } catch (err) {
      if (err instanceof ZodError) {
        const formattedError = err.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        }));

        return next(
          new UnprocessableEntity(
            formattedError,
            "Unprocessable Entity",
            ErrorCode.UNPROCESSABLE_ENTITY
          )
        );
      } else {
        return next(
          new InternalException(
            "Something went wrong",
            err,
            ErrorCode.INTERNAL_EXCEPTION
          )
        );
      }
    }
  };
}

function validateQuery(schema: ZodSchema) {
  return function (req: Request, res: Response, next: NextFunction) {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        next(
          new UnprocessableEntity(
            err?.issues,
            "Unprocessable Entity",
            ErrorCode.UNPROCESSABLE_ENTITY
          )
        );
      } else {
        next(
          new InternalException(
            "Something went wrong",
            err,
            ErrorCode.INTERNAL_EXCEPTION
          )
        );
      }
    }
  };
}

export { validateRequest, validateQuery };
