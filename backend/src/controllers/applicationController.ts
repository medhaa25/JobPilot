import type { Request, Response } from "express";
import { z } from "zod";
import { createApplicationSchema, updateApplicationSchema } from "../schemas/application.schema.js";
import * as service from "../services/applicationServices.js";
import { HttpError } from "../utils/HttpError.js";

// A malformed id (not a UUID) would make Postgres throw, so treat it as "not found".
function parseId(raw: string): string {
  const parsed = z.uuid().safeParse(raw);
  if (!parsed.success) throw new HttpError(404, "Application not found");
  return parsed.data;
}

export async function list(_req: Request, res: Response) {
  res.json(await service.listApplications(res.locals.userId));
}

export async function getOne(req: Request, res: Response) {
  res.json(await service.getApplication(res.locals.userId, parseId(req.params.id as string)));
}

export async function create(req: Request, res: Response) {
  const parsed = createApplicationSchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, parsed.error.issues[0].message);

  const app = await service.createApplication(res.locals.userId, parsed.data);
  res.status(201).json(app);
}

export async function update(req: Request, res: Response) {
  const parsed = updateApplicationSchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, parsed.error.issues[0].message);

  res.json(await service.updateApplication(res.locals.userId, parseId(req.params.id as string), parsed.data));
}

export async function remove(req: Request, res: Response) {
  await service.deleteApplication(res.locals.userId, parseId(req.params.id as string));
  res.status(204).send();
}

export async function events(req: Request, res: Response) {
  res.json(await service.listApplicationEvents(res.locals.userId, parseId(req.params.id as string)));
}