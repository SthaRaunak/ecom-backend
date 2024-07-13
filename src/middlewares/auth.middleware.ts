import { Request, Response, NextFunction } from "express-serve-static-core";
import { BadRequestException } from "../exceptions/bad-requests";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secrets";
import { ErrorCode } from "../exceptions/root";
import { prismaClient } from "..";
import { UnauthorizedException } from "../exceptions/unauthorized";

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
  const accessToken = req.headers["authorization"];
  try {
    if (!accessToken) {
      throw new Error();
    }
    const payload = jwt.verify(accessToken, JWT_SECRET) as any; //throws error if not valid or expired

    const user = await prismaClient.user.findFirst({
      where: { id: payload?.userId },
    });

    console.log("user:", user?.name);

    if (!user) {
      throw new Error();
    }

    req.user = user;
    next();
  } catch (error) {
    return next(
      new UnauthorizedException("Unauthorized", ErrorCode.UNAUTHORIZED)
    );
  }
}
