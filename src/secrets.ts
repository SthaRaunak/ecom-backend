import dotenv from "dotenv";

dotenv.config({
  path: ".env",
});

export const PORT = process.env.PORT || 3000;
export const JWT_SECRET = process.env.JWT_SECRET!;
export const ACCESS_TOKEN_EXPIRY_DURATION =
  process.env.ACCESS_TOKEN_EXPIRY_DURATION;

export const REFRESH_TOKEN_EXPIRY_DURATION =
  process.env.REFRESH_TOKEN_EXPIRY_DURATION;
