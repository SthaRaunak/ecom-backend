import express from "express";
import { PORT } from "./secrets";
import rootRouter from "./routes";
import { PrismaClient } from "@prisma/client";
import { errorMiddleware } from "./middlewares/errors";
import { z } from "zod";
import cookieParser from "cookie-parser";
import { customErrorMap } from "./utils/zodErrorMap";

const app = express();

app.use(express.json());
app.use(cookieParser());
z.setErrorMap(customErrorMap);

app.use("/api", rootRouter);

export const prismaClient = new PrismaClient({
  log: ["query"],
}).$extends({
  result: {
    address: {
      formattedAddress: {
        needs: {
          lineOne: true,
          lineTwo: true,
          city: true,
          country: true,
          pincode: true,
        },
        compute: (address) => {
          return `${address.lineOne}, ${
            address.lineTwo ? address.lineTwo + ", " : ""
          }${address.city}, ${address.country}-${address.pincode}`;
        },
      },
    },
  },
});

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`server running on PORT: ${PORT}`);
});
