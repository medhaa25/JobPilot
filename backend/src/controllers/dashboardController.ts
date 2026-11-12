import type { Request, Response } from "express";
import { getOverview } from "../services/dashboardServices.js";

export async function overview(_req: Request, res: Response) {
  res.json(await getOverview(res.locals.userId));
}