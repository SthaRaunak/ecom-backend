import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import {
  cancelOrder,
  changeStatus,
  createOrder,
  getOrderById,
  listAllOrders,
  listOrders,
  listUserOrders,
} from "../controllers/order.controller";
import adminMiddleware from "../middlewares/admin";
import {
  validateQuery,
  validateRequest,
} from "../middlewares/validation.middleware";
import {
  changeStatusSchema,
  listAllOrdersQuerySchema,
  listUsersOrdersQuerySchema,
} from "../schema/order.schema";

const router = Router();

router.route("/").post(authMiddleware, asyncHandler(createOrder));
router.route("/:id/cancel").put(authMiddleware, asyncHandler(cancelOrder));
router.route("/").get(authMiddleware, asyncHandler(listOrders));

//admin routes ( order management ) ->

router
  .route("/index")
  .get(
    authMiddleware,
    adminMiddleware,
    validateQuery(listAllOrdersQuerySchema),
    asyncHandler(listAllOrders)
  );

router
  .route("/users/:id")
  .get(
    authMiddleware,
    adminMiddleware,
    validateQuery(listUsersOrdersQuerySchema),
    asyncHandler(listUserOrders)
  );

router
  .route("/status/:id")
  .put(
    authMiddleware,
    adminMiddleware,
    validateRequest(changeStatusSchema),
    asyncHandler(changeStatus)
  );

// <- admin routes ( order management )

router.route("/:id").get(authMiddleware, asyncHandler(getOrderById));

export default router;
