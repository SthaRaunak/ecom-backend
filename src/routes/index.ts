import { Router } from "express";
import authRouter from "./auth.route";
import productRouter from "./product.route";

const rootRouter = Router();

rootRouter.use("/auth", authRouter);
rootRouter.use("/products", productRouter);

export default rootRouter;
