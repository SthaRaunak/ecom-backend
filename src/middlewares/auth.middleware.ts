import { Request, Response, NextFunction } from "express-serve-static-core";
import { BadRequestException } from "../exceptions/bad-requests";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secrets";
import { ErrorCode } from "../exceptions/root";
import { prismaClient } from "..";
import { UnauthorizedException } from "../exceptions/unauthorized";
import { User } from "@prisma/client";

type JWTPayload = {
  userId: number;
};

//pseudo code:
// 1) extract token from header
// 2) if token absent, throw unauthorized exception
// 2) if token present, verify and extract payload
// 3) make a query to db get the user and attact it to request

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers["authorization"];

  if (!token) {
    return next(
      new UnauthorizedException("Unauthorized", ErrorCode.UNAUTHORIZED)
    );
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any; //throws error if not valid
    const user = await prismaClient.user.findFirst({
      where: { id: payload?.userId },
    });
    console.log("user:", user);
    if (!user) {
      return next(
        new UnauthorizedException("Unauthorized", ErrorCode.UNAUTHORIZED)
      );
    }

    req.user = user;
    next();
  } catch (error) {
    return next(
      new UnauthorizedException("Unauthorized", ErrorCode.UNAUTHORIZED)
    );
  }
}
