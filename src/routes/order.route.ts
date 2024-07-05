import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import {
  cancelOrder,
  createOrder,
  getOrderById,
  listOrders,
} from "../controllers/order.controller";

const router = Router();

router.route("/").post(authMiddleware, asyncHandler(createOrder));
router.route("/:id/cancel").put(authMiddleware, asyncHandler(cancelOrder));
router.route("/").get(authMiddleware, asyncHandler(listOrders));
router.route("/:id").get(authMiddleware, asyncHandler(getOrderById));

export default router;
