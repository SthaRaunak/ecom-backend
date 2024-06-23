import { Request, Response, NextFunction } from "express-serve-static-core";
import { prismaClient } from "../index";

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

export { createProduct };
