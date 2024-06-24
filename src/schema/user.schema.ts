import { z } from "zod";

export const SignUpSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
});

export const LoginSchema = SignUpSchema.omit({ name: true });

export const AddAddressSchema = z.object({
  lineOne: z.string(),
  lineTwo: z.string().nullable(),
  city: z.string(),
  country: z.string(),
  pincode: z.string().length(6),
});