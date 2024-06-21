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
import { JWT_SECRET } from "../secrets";
import { NotFoundException } from "../exceptions/not-found";

const signUp = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, name } = req.body;

  let user = await prismaClient.user.findFirst({ where: { email } });

  if (user) {
    throw new BadRequestException(
      "User alrady exists",
      ErrorCode.USER_ALREADY_EXIST
    );
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  user = await prismaClient.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  return res.status(200).json(user);
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  let user = await prismaClient.user.findFirst({ where: { email } });

  if (!user) {
    throw new NotFoundException("User not found", ErrorCode.USER_NOT_FOUND);
  }

  if (!(await bcrypt.compare(password, user.password))) {
    throw new BadRequestException(
      "Incorrect Password",
      ErrorCode.INCORRECT_PASSWORD
    );
  }

  const token = jwt.sign(
    {
      userId: user.id,
    },
    JWT_SECRET
  );

  return res.status(200).json({
    user,
    token,
  });
};

export { login, signUp };
