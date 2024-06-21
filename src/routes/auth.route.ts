import express from "express";
import { login, signUp } from "../controllers/auth.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { validateRequest } from "../middlewares/validation.middlware";
import { LoginSchema, SignUpSchema } from "../schema/user.schema";

const router = express.Router();

router
  .route("/signup")
  .post(validateRequest(SignUpSchema), asyncHandler(signUp));
router.route("/login").post(validateRequest(LoginSchema), asyncHandler(login));

export default router;
