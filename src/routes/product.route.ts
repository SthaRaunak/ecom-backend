import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { createProduct } from "../controllers/product.controller";
import { validateRequest } from "../middlewares/validation.middleware";
import { createProductSchema } from "../schema/product.schema";
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

export default router;
