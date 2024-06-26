import express from "express";
import {
  createAddress,
  deleteAddress,
  listAddress,
  updateUser,
} from "../controllers/user.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validateRequest } from "../middlewares/validation.middleware";
import { AddAddressSchema, UpdateUserSchema } from "../schema/user.schema";

const router = express.Router();

router
  .route("/address")
  .post(
    authMiddleware,
    validateRequest(AddAddressSchema),
    asyncHandler(createAddress)
  );

router
  .route("/address/:id")
  .delete(authMiddleware, asyncHandler(deleteAddress));

router.route("/address").get(authMiddleware, asyncHandler(listAddress));

router
  .route("/")
  .put(
    authMiddleware,
    validateRequest(UpdateUserSchema),
    asyncHandler(updateUser)
  );

export default router;
