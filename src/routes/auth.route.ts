import express from "express";
import { login, signUp, me } from "../controllers/auth.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { validateRequest } from "../middlewares/validation.middleware";
import { LoginSchema, SignUpSchema } from "../schema/user.schema";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();

router
  .route("/signup")
  .post(validateRequest(SignUpSchema), asyncHandler(signUp));
router.route("/login").post(validateRequest(LoginSchema), asyncHandler(login));

router.route("/me").get(authMiddleware, me);

export default router;
