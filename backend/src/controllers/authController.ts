import type { Request, Response } from "express";
import { signupSchema, loginSchema } from "../schemas/auth.schema.js";
import { createUser, getUserById, verifyCredentials } from "../services/authServices.js";
import { HttpError } from "../utils/HttpError.js";
import { clearAuthCookie, setAuthCookie } from "../utils/authcookie.js";
import { signToken } from "../utils/token.js";
export async function signup(req: Request, res: Response) {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, parsed.error.issues[0].message);
  }

  const { name, email, password } = parsed.data;

  const user = await createUser(name, email, password);
  setAuthCookie(res, signToken(user.id));
  res.status(201).json(user);
  }

  export async function login(req: Request, res: Response) {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) throw new HttpError(400, parsed.error.issues[0].message);

    const user = await verifyCredentials(parsed.data.email, parsed.data.password);
    setAuthCookie(res, signToken(user.id));
    res.json(user);
  }

  export function logout(_req: Request, res: Response) {
    clearAuthCookie(res);
    res.status(204).send();
  }

  export async function me(_req: Request, res: Response) {
    const user = await getUserById(res.locals.userId);
    if (!user) throw new HttpError(401, "Not authenticated");
    res.json(user);
  }