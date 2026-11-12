import type { RequestHandler } from "express";
import { HttpError } from "../utils/HttpError.js";
import { verifyToken } from "../utils/token.js";

export const requireAuth: RequestHandler = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) throw new HttpError(401, "Not authenticated");

  try {
    res.locals.userId = verifyToken(token);
  } catch {
    throw new HttpError(401, "Session expired, please log in again");
  }
  next();
};