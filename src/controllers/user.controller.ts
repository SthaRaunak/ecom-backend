import { Request, Response, NextFunction } from "express-serve-static-core";
import { prismaClient } from "../index";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { Address } from "@prisma/client";
import { BadRequestException } from "../exceptions/bad-requests";
import { type UpdateUser, UpdateUserSchema } from "../schema/user.schema";

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
    next(
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
        next(
          new BadRequestException(
            "Address does not belong to User",
            ErrorCode.ADDRESS_NOT_FOUND
          )
        );
      }
    } catch (err) {
      next(
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
        next(
          new BadRequestException(
            "Address does not belong to User",
            ErrorCode.ADDRESS_NOT_FOUND
          )
        );
      }
    } catch (error) {
      next(
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
export { createAddress, deleteAddress, listAddress, updateUser };
