import { z } from "zod";

export const SignUpSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
});

export const LoginSchema = SignUpSchema.omit({ name: true }).extend({
  password: z.string(),
});

export const AddAddressSchema = z.object({
  lineOne: z.string(),
  lineTwo: z.string().nullable().optional(),
  city: z.string(),
  country: z.string(),
  pincode: z.string().length(6),
});

export const UpdateUserSchema = z.object({
  name: z.string().optional(),
  defaultShippingAddressId: z.number().optional(),
  defaultBillingAddressId: z.number().optional(),
});

export const ChangeUserRoleSchema = z.object({
  role: z.enum(["ADMIN", "USER"]),
});

export type UpdateUser = z.infer<typeof UpdateUserSchema>;
