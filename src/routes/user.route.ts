import express from "express";
import {
  changeUserRole,
  createAddress,
  deleteAddress,
  getUserById,
  listAddress,
  listUsers,
  updateUser,
} from "../controllers/user.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validateRequest } from "../middlewares/validation.middleware";
import {
  AddAddressSchema,
  ChangeUserRoleSchema,
  UpdateUserSchema,
} from "../schema/user.schema";
import adminMiddleware from "../middlewares/admin";

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
// admin routes ( user management ) ->
router.route("/").get(authMiddleware, adminMiddleware, asyncHandler(listUsers));

router
  .route("/:id")
  .get(authMiddleware, adminMiddleware, asyncHandler(getUserById));

router
  .route("/role/:id")
  .put(
    authMiddleware,
    adminMiddleware,
    validateRequest(ChangeUserRoleSchema),
    asyncHandler(changeUserRole)
  );

// <- admin routes( user management )

router.route("/").get(authMiddleware, adminMiddleware, asyncHandler(listUsers));
export default router;
