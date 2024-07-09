import { NextFunction, Request, Response } from "express-serve-static-core";
import { prismaClient } from "..";
import { UnauthorizedException } from "../exceptions/unauthorized";
import { ErrorCode } from "../exceptions/root";
import { NotFoundException } from "../exceptions/not-found";
import { Order } from "@prisma/client";

//Note : we have order and orderEvent as one to many as were storing the history of event changes of our order & order it self has status i.e active status

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user!;
  // To create a transaction
  // To list all the cart items and proceed if the cart is not empty
  // calculate the total amount
  // fetch address of the user and for format it
  // to define computed field on address model
  // we will create a order and order products
  // create event

  return await prismaClient.$transaction(async (tx) => {
    const cartItems = await tx.cartItem.findMany({
      where: {
        userId: user.id,
      },
      include: {
        product: {
          select: {
            price: true,
          },
        },
      },
    });

    if (cartItems.length <= 0) {
      return res.json({ message: "cart is empty" });
    }

    //Total Price
    const price = cartItems.reduce((prev, curr) => {
      return prev + curr.quantity * Number(curr.product.price);
    }, 0);

    let address;
    try {
      address = await tx.address.findFirstOrThrow({
        where: {
          id: user.defaultShippingAddress!,
        },
      });
    } catch (error) {
      return next();
    }

    const order = await tx.order.create({
      data: {
        userId: user.id,
        netAmount: price,
        address: address.formattedAddress,
        products: {
          create: cartItems.map((cart) => {
            return {
              productId: cart.productId,
              quantity: cart.quantity,
            };
          }),
        },
      },
    });

    const orderEvent = await tx.orderEvent.create({
      data: {
        orderId: order.id,
      },
    });

    await tx.cartItem.deleteMany({
      where: {
        userId: user.id,
      },
    });

    return res.status(200).json(order);
  });
};

const listOrders = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user!;

  const orders = await prismaClient.order.findMany({
    where: {
      userId: user.id,
    },
    include: {
      products: true,
      events: {
        select: {
          status: true,
          updatedAt: true,
        },
      },
    },
  });

  return res.status(200).json(orders);
};

const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
  const { id: orderId } = req.params;
  const user = req.user!;
  let order: Order;
  try {
    order = await prismaClient.order.findFirstOrThrow({
      where: {
        id: Number(orderId),
      },
    });

    if (order.userId !== user.id) {
      return next(
        new UnauthorizedException(
          "Order doesnt belong to user.",
          ErrorCode.UNAUTHORIZED
        )
      );
    }
  } catch (error) {
    return next(
      new NotFoundException("Order not found", ErrorCode.ORDER_NOT_FOUND)
    );
  }

  await prismaClient.orderEvent.create({
    data: {
      orderId: order.id,
      status: "CANCELLED",
    },
  });
  //change active status
  const updatedOrder = await prismaClient.order.update({
    where: {
      id: order.id,
    },
    data: {
      status: "CANCELLED",
    },
  });

  return res.status(200).json({ message: "success", data: updatedOrder });
};

const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id: orderId } = req.params;
  const user = req.user!;
  let order: Order;
  try {
    order = await prismaClient.order.findFirstOrThrow({
      where: {
        id: Number(orderId),
      },
      include: {
        products: true,
        events: {
          select: {
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (order.userId !== user.id) {
      return next(
        new UnauthorizedException(
          "Order doesnt belong to user.",
          ErrorCode.UNAUTHORIZED
        )
      );
    }
  } catch (error) {
    return next(
      new NotFoundException("Order not found", ErrorCode.ORDER_NOT_FOUND)
    );
  }

  return res.status(200).json(order);
};

const listAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let whereClause = {};
  const { offset, limit, status } = req.query;

  if (status) {
    whereClause = {
      status: status,
    };
  }

  const count = await prismaClient.order.count();
  const orders = await prismaClient.order.findMany({
    where: {
      ...whereClause,
    },
    skip: Number(offset) || 0,
    take: Number(limit) || 5,
  });

  return res.status(200).json({
    count,
    data: orders,
  });
};
const listUserOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id: userId } = req.params;
  let whereClause = {};

  const { status } = req.query;

  if (status) {
    whereClause = {
      status,
    };
  }

  let user;
  try {
    user = await prismaClient.user.findFirstOrThrow({
      where: {
        id: Number(userId),
      },
    });
  } catch (err) {
    return next(
      new NotFoundException("User doesnt exist", ErrorCode.USER_NOT_FOUND)
    );
  }

  const userOrders = await prismaClient.order.findMany({
    where: {
      userId: user.id,
      ...whereClause,
    },
  });

  return res.status(200).json(userOrders);
};

const changeStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { status } = req.body;
  const { id: orderId } = req.params;

  return await prismaClient.$transaction(async (tx) => {
    let order;
    try {
      order = await tx.order.findFirstOrThrow({
        where: {
          id: Number(orderId),
        },
      });
    } catch (err) {
      return next(
        new NotFoundException("Order not found", ErrorCode.ORDER_NOT_FOUND)
      );
    }

    const updatedOrder = await tx.order.update({
      where: {
        id: order.id,
      },
      data: {
        status,
      },
    });

    return res.status(200).json(updatedOrder);
  });
};

export {
  createOrder,
  listOrders,
  cancelOrder,
  getOrderById,
  listAllOrders,
  listUserOrders,
  changeStatus,
};
