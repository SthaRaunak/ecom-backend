import { z } from "zod";
import { OrderEventStatus } from "@prisma/client";

const { ACCEPTED, CANCELLED, DELIVERED, OUT_FOR_DELIVERY, PENDING } =
  OrderEventStatus;

export const changeStatusSchema = z.object({
  status: z.enum([ACCEPTED, CANCELLED, DELIVERED, OUT_FOR_DELIVERY, PENDING]),
});

export const listUsersOrdersQuerySchema = changeStatusSchema.partial();

export const listAllOrdersQuerySchema = listUsersOrdersQuerySchema.extend({
  offset: z.string().optional(),
  limit: z.string().optional(),
});
