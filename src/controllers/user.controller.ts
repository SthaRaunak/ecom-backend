import { Request, Response, NextFunction } from "express-serve-static-core";
import { prismaClient } from "../index";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";

const addAddress = async (req: Request, res: Response, next: NextFunction) => {
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

export { addAddress, deleteAddress, listAddress };
