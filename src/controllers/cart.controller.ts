import { Request, Response, NextFunction } from "express-serve-static-core";
import { prismaClient } from "..";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { BadRequestException } from "../exceptions/bad-requests";

const addItemToCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //Check for the existence of the same product in user's cart and alter the quantity as required
  const user = req.user!;
  const { productId, quantity } = req.body;

  try {
    await prismaClient.product.findFirstOrThrow({
      where: {
        id: productId,
      },
    });
  } catch (err) {
    return next(
      new NotFoundException("Product not Found!", ErrorCode.PRODUCT_NOT_FOUND)
    );
  }

  const userCart = await prismaClient.cartItem.findFirst({
    where: {
      userId: user.id,
      productId: productId,
    },
  });

  let cart;
  if (userCart) {
    cart = await prismaClient.cartItem.update({
      where: {
        id: userCart.id,
      },
      data: {
        quantity: userCart.quantity + 1,
      },
    });
  } else {
    cart = await prismaClient.cartItem.create({
      data: {
        userId: user.id,
        productId,
        quantity,
      },
    });
  }

  return res.status(200).json(cart);
};

const removeItemFromCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  const { id: cartId } = req.params;

  let cartItem;
  try {
    cartItem = await prismaClient.cartItem.findFirstOrThrow({
      where: {
        id: Number(cartId),
      },
    });

    if (cartItem.userId !== user?.id) {
      return next(
        new BadRequestException(
          "Item doest not belong to User",
          ErrorCode.UNAUTHORIZED
        )
      );
    }
  } catch (err) {
    return next(
      new NotFoundException("Item Not Found", ErrorCode.CARTITEM_NOT_FOUND)
    );
  }

  await prismaClient.cartItem.delete({
    where: {
      id: Number(cartId),
    },
  });

  return res.status(201).json({ success: true });
};

const changeQuantity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  const { id } = req.params;
  const { quantity: newQuantity } = req.body;
  let cartItem;
  try {
    cartItem = await prismaClient.cartItem.findFirstOrThrow({
      where: {
        id: Number(id),
      },
    });
    if (user?.id !== cartItem?.userId) {
      return next(
        new BadRequestException(
          "Item does not belong to user",
          ErrorCode.UNAUTHORIZED
        )
      );
    }
  } catch (err) {
    return next(
      new NotFoundException("Item Not Found", ErrorCode.CARTITEM_NOT_FOUND)
    );
  }

  const newCart = await prismaClient.cartItem.update({
    where: {
      id: cartItem?.id,
    },
    data: {
      quantity: newQuantity,
    },
  });
  res.status(200).json({
    sucess: true,
    updatedCart: newCart,
  });
};

const getCart = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user!;
  const cart = await prismaClient.cartItem.findMany({
    where: {
      userId: user.id,
    },
    include: {
      product: {
        select: {
          name: true,
          description: true,
          price: true,
          tags: true,
        },
      },
    },
  });

  return res.status(200).json(cart);
};

export { addItemToCart, removeItemFromCart, changeQuantity, getCart };
