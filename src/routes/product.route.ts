import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {
  createProduct,
  deleteProduct,
  getProductById,
  listProduct,
  updateProduct,
} from "../controllers/product.controller";
import { validateRequest } from "../middlewares/validation.middleware";
import {
  createProductSchema,
  updateProductSchema,
} from "../schema/product.schema";
import { authMiddleware } from "../middlewares/auth.middleware";
import adminMiddleware from "../middlewares/admin";

const router = Router();

router
  .route("/")
  .post(
    authMiddleware,
    adminMiddleware,
    validateRequest(createProductSchema),
    asyncHandler(createProduct)
  );

router
  .route("/:id")
  .put(
    authMiddleware,
    adminMiddleware,
    validateRequest(updateProductSchema),
    asyncHandler(updateProduct)
  );

router
  .route("/:id")
  .delete(authMiddleware, adminMiddleware, asyncHandler(deleteProduct));

router.route("/").get(asyncHandler(listProduct));
router.route("/:id").get(asyncHandler(getProductById));
export default router;
