import express from "express";
import {
  addItemToCart,
  changeQuantity,
  getCart,
  removeItemFromCart,
} from "../controllers/cart.controller";
import { validateRequest } from "../middlewares/validation.middleware";
import { CartSchema, changeQuantitySchema } from "../schema/cart.schema";
import { authMiddleware } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const Router = express.Router();

Router.route("/").post(
  authMiddleware,
  validateRequest(CartSchema),
  asyncHandler(addItemToCart)
);
Router.route("/").get(authMiddleware, asyncHandler(getCart));
Router.route("/:id").delete(authMiddleware, asyncHandler(removeItemFromCart));
Router.route("/:id").put(
  authMiddleware,
  validateRequest(changeQuantitySchema),
  asyncHandler(changeQuantity)
);

export default Router;
