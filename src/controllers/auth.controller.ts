import type {
  Request,
  Response,
  NextFunction,
} from "express-serve-static-core";
import { prismaClient } from "../index";
import bcrypt, { compare } from "bcrypt";
import { SALT_ROUNDS } from "../constants";
import { BadRequestException } from "../exceptions/bad-requests";
import { ErrorCode } from "../exceptions/root";
import { asyncHandler } from "../utils/asyncHandler";

const signUp = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, name } = req.body;

    let user = await prismaClient.user.findFirst({ where: { email } });

    if (user) {
      next(
        new BadRequestException(
          "User alrady exists",
          ErrorCode.USER_ALREADY_EXIST
        )
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

    res.status(200).json(user);
  }
);

const login = () => {};
export { login, signUp };
