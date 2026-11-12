import type { Response } from "express";
import { env } from "../config/env.js";

const options = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: env.NODE_ENV === "production",
};

export function setAuthCookie(res: Response, token: string) {
  res.cookie("token", token, { ...options, maxAge: 7 * 24 * 60 * 60 * 1000 });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie("token", options);
}