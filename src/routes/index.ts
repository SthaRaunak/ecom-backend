import { Router } from "express";
import authRouter from "./auth.route";
import productRouter from "./product.route";
import userRouter from "./user.route";
import cartRouter from "./cart.route";
import orderRouter from "./order.route";

const rootRouter = Router();

rootRouter.use("/auth", authRouter);
rootRouter.use("/products", productRouter);
rootRouter.use("/user", userRouter);
rootRouter.use("/cart", cartRouter);
rootRouter.use("/order", orderRouter);

export default rootRouter;
