import jwt, { Secret, SignOptions } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const secretKey: Secret = process.env.JWT_SECRET_KEY || "your-refresh-secret";

export const generateToken = (
  user: { id: number; email: string },
  // expiresIn = "1h"
  expiresIn: SignOptions["expiresIn"] = "1h"
): string => {
  return jwt.sign(user, secretKey, { expiresIn });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, secretKey);
  } catch (err) {
    throw new Error("Invalid or expired token");
  }
};
