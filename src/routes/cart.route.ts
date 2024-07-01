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

const Router = express.Router();

Router.route("/").post(
  authMiddleware,
  validateRequest(CartSchema),
  addItemToCart
);
Router.route("/").get(authMiddleware, getCart);
Router.route("/:id").delete(authMiddleware, removeItemFromCart);
Router.route("/:id").put(
  authMiddleware,
  validateRequest(changeQuantitySchema),
  changeQuantity
);

export default Router;
