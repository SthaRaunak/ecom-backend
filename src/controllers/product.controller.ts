import { Request, Response, NextFunction } from "express-serve-static-core";
import { prismaClient } from "../index";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";

const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, description, price, tags } = req.body;

  //tags transformation : ["tea","nepal"] => tea,nepal

  const product = await prismaClient.product.create({
    data: {
      ...req.body,
      tags: req.body.tags.join(","),
    },
  });

  res.status(200).json(product);
};

const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const product = req.body;

    if (product.tags) {
      product.tags = product.tags.join(",");
    }

    const updatedProduct = await prismaClient.product.update({
      where: { id: Number(id) },
      data: product,
    });

    res.status(200).json(updatedProduct);
  } catch (err) {
    next(
      new NotFoundException("Product not found.", ErrorCode.PRODUCT_NOT_FOUND)
    );
  }
};

const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    await prismaClient.product.delete({
      where: { id: Number(id) },
    });

    res.status(204).json({});
  } catch (err) {
    next(
      new NotFoundException("Product not found.", ErrorCode.PRODUCT_NOT_FOUND)
    );
  }
};

const listProduct = async (req: Request, res: Response) => {
  const { offset, limit } = req.query;
  const count = await prismaClient.product.count();
  const products = await prismaClient.product.findMany({
    skip: Number(offset) || 0,
    take: Number(limit) || 5,
  });

  return res.status(200).json({
    count: count,
    data: products,
  });
};

const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: productId } = req.params;
    //findFirstOrThrow same as findFirst but throws error if not found
    const product = await prismaClient.product.findFirstOrThrow({
      where: { id: Number(productId) },
    });

    return res.status(200).json({
      product,
    });
  } catch (err) {
    return next(
      new NotFoundException("Product not found.", ErrorCode.PRODUCT_NOT_FOUND)
    );
  }
};

export {
  createProduct,
  deleteProduct,
  updateProduct,
  listProduct,
  getProductById,
};
