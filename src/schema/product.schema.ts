import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number(),
  tags: z.string().array(),
});

export const updateProductSchema = createProductSchema.partial();
