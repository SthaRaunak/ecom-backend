import express from "express";
import {
  addAddress,
  deleteAddress,
  listAddress,
} from "../controllers/user.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validateRequest } from "../middlewares/validation.middleware";
import { AddAddressSchema } from "../schema/user.schema";

const router = express.Router();

router
  .route("/address")
  .post(
    authMiddleware,
    validateRequest(AddAddressSchema),
    asyncHandler(addAddress)
  );

router
  .route("/address/:id")
  .delete(authMiddleware, asyncHandler(deleteAddress));

router.route("/address").get(authMiddleware, asyncHandler(listAddress));

export default router;
