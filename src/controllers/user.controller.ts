import { Request, Response, NextFunction } from "express-serve-static-core";
import { prismaClient } from "../index";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { Address } from "@prisma/client";
import { BadRequestException } from "../exceptions/bad-requests";
import { type UpdateUser, UpdateUserSchema } from "../schema/user.schema";
import { UnauthorizedException } from "../exceptions/unauthorized";

const createAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  const address = await prismaClient.address.create({
    data: {
      ...req.body,
      userId: user?.id,
    },
  });

  return res.status(200).json(address);
};

const deleteAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: addressId } = req.params;
    await prismaClient.address.delete({ where: { id: Number(addressId) } });
    return res.status(201).json({});
  } catch (err) {
    return next(
      new NotFoundException("Address not found.", ErrorCode.ADDRESS_NOT_FOUND)
    );
  }
};

const listAddress = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  const addresses = await prismaClient.address.findMany({
    where: { userId: user?.id },
  });

  return res.status(200).json({
    data: addresses,
  });
};

const updateUser = async (
  req: Request<{}, {}, UpdateUser>,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  const data = req.body;

  let shippingAddress: Address;
  let billingAddress: Address;

  if (data.defaultShippingAddressId) {
    try {
      shippingAddress = await prismaClient.address.findFirstOrThrow({
        where: {
          id: data.defaultShippingAddressId,
        },
      });
      if (shippingAddress.userId !== user?.id) {
        return next(
          new BadRequestException(
            "Address does not belong to User",
            ErrorCode.ADDRESS_NOT_FOUND
          )
        );
      }
    } catch (err) {
      return next(
        new NotFoundException("Address Not Found.", ErrorCode.ADDRESS_NOT_FOUND)
      );
    }
  }

  if (data.defaultBillingAddressId) {
    try {
      billingAddress = await prismaClient.address.findFirstOrThrow({
        where: {
          id: data.defaultBillingAddressId,
        },
      });
      if (billingAddress.userId !== user?.id) {
        return next(
          new BadRequestException(
            "Address does not belong to User",
            ErrorCode.ADDRESS_NOT_FOUND
          )
        );
      }
    } catch (error) {
      return next(
        new NotFoundException("Address Not Found.", ErrorCode.ADDRESS_NOT_FOUND)
      );
    }
  }

  const updatedUser = await prismaClient.user.update({
    where: {
      id: user?.id,
    },
    data: { ...data },
  });

  return res.status(200).json({
    updatedUser,
  });
};

const listUsers = async (req: Request, res: Response, next: NextFunction) => {
  const { offset, limit } = req.query;
  const count = await prismaClient.user.count();
  const users = await prismaClient.user.findMany({
    skip: Number(offset) || 0,
    take: Number(limit) || 5,
  });

  return res.status(200).json({
    count: count,
    data: users,
  });
};

const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  const { id: userId } = req.params;
  try {
    const user = await prismaClient.user.findFirstOrThrow({
      where: {
        id: Number(userId),
      },
      include: {
        adresses: true,
      },
    });

    return res.status(200).json(user);
  } catch (err) {
    return next(
      new NotFoundException("User not found", ErrorCode.USER_NOT_FOUND)
    );
  }
};

const changeUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user!;

  const { role } = req.body;
  const { id: userId } = req.params;

  if (user.id === Number(userId)) {
    return next(
      new UnauthorizedException(
        "Cannot change role of self",
        ErrorCode.UNAUTHORIZED
      )
    );
  }

  const updatedUser = await prismaClient.user.update({
    where: {
      id: Number(userId),
    },
    data: {
      role: role,
    },
  });

  return res.status(200).json(updatedUser);
};

export {
  createAddress,
  deleteAddress,
  listAddress,
  updateUser,
  listUsers,
  getUserById,
  changeUserRole,
};
