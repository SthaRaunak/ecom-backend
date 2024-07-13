import type {
  Request,
  Response,
  NextFunction,
} from "express-serve-static-core";

import { prismaClient } from "../index";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { SALT_ROUNDS } from "../constants";
import { BadRequestException } from "../exceptions/bad-requests";
import { ErrorCode } from "../exceptions/root";
import {
  ACCESS_TOKEN_EXPIRY_DURATION,
  JWT_SECRET,
  REFRESH_TOKEN_EXPIRY_DURATION,
} from "../secrets";
import { NotFoundException } from "../exceptions/not-found";
import { CookieOptions } from "express";
import { UnauthorizedException } from "../exceptions/unauthorized";
import { InternalException } from "../exceptions/internal-exception";
import { User } from "@prisma/client";

const generateAccessAndRefreshToken = async (user: User) => {
  try {
    const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY_DURATION,
    });

    const refreshToken = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRY_DURATION,
    });

    if (!accessToken || !refreshToken) {
      throw new Error();
    }

    await prismaClient.user.update({
      where: {
        id: user.id,
      },
      data: {
        refreshToken,
      },
    });

    return { accessToken, refreshToken };
  } catch (err) {
    throw new InternalException(
      "Error generating access and refresh token",
      err,
      ErrorCode.INTERNAL_EXCEPTION
    );
  }
};

const signUp = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, name } = req.body;

  const user = await prismaClient.user.findFirst({ where: { email } });

  if (user) {
    throw new BadRequestException(
      "User alrady exists",
      ErrorCode.USER_ALREADY_EXIST
    );
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const newUser = await prismaClient.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      role: true,
      defaultShippingAddress: true,
      defaultBillingAddress: true,
      createdAt: true,
    },
  });

  return res.status(200).json(newUser);
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  const user = await prismaClient.user.findFirst({
    where: { email },
  });

  if (!user) {
    throw new NotFoundException("User not found", ErrorCode.USER_NOT_FOUND);
  }

  if (!(await bcrypt.compare(password, user.password))) {
    throw new BadRequestException(
      "Incorrect Password",
      ErrorCode.INCORRECT_PASSWORD
    );
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user
  );

  const cookieOption: CookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  };

  const {
    updatedAt,
    refreshToken: omittedRefreshToken,
    password: omittedPassword,
    ...resUser
  } = user;

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, cookieOption)
    .json({
      user: resUser,
      accessToken,
    });
};

// /me endpoint -> return the logged in user

const me = async (req: Request, res: Response, next: NextFunction) => {
  const {
    updatedAt,
    refreshToken: omittedRefreshToken,
    password: omittedPassword,
    ...resUser
  } = req.user!;

  return res.json(resUser);
};

const refresh = async (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken: incomingRefreshToken } = req.cookies;

  if (!incomingRefreshToken) {
    return next(
      new NotFoundException(
        "Refresh token doesnt exist",
        ErrorCode.TOKEN_NOT_FOUND
      )
    );
  }

  try {
    const refreshTokenPayload = jwt.verify(
      incomingRefreshToken,
      JWT_SECRET
    ) as any;

    const user = await prismaClient.user.findFirst({
      where: {
        id: refreshTokenPayload?.userId,
      },
    });

    if (!user) {
      return next(
        new NotFoundException(
          "User with that refresh token doesnt exist",
          ErrorCode.USER_NOT_FOUND
        )
      );
    }

    if (incomingRefreshToken !== user.refreshToken) {
      throw new Error();
    }

    const newAccessToken = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY_DURATION,
    });

    return res.status(200).json({
      accessToken: newAccessToken,
    });
  } catch (err) {
    return next(
      new UnauthorizedException(
        "Unauthorized: Error validating refresh token",
        ErrorCode.UNAUTHORIZED
      )
    );
  }
};

export { login, signUp, me, refresh };
