import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): string {
  const payload = jwt.verify(token, env.JWT_SECRET); // throws if tampered or expired
  if (typeof payload === "string" || typeof payload.sub !== "string") {
    throw new Error("Invalid token payload");
  }
  return payload.sub;
}