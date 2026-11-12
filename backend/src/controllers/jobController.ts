import type { Request, Response } from "express";
import { jobsQuerySchema } from "../schemas/job.schema.js";
import * as service from "../services/jobService.js";
import { HttpError } from "../utils/HttpError.js";
import { parseUuid } from "../utils/parseUuid.js";

const NOT_FOUND = "Job not found";

export async function list(req: Request, res: Response) {
  const parsed = jobsQuerySchema.safeParse(req.query);
  if (!parsed.success) throw new HttpError(400, parsed.error.issues[0].message);

  res.json(await service.searchJobs(res.locals.userId, parsed.data));
}

export async function getOne(req: Request, res: Response) {
  res.json(await service.getJob(res.locals.userId, parseUuid(req.params.id as string, NOT_FOUND)));
}

export async function save(req: Request, res: Response) {
  await service.saveJob(res.locals.userId, parseUuid(req.params.id as string, NOT_FOUND));
  res.status(204).send();
}

export async function unsave(req: Request, res: Response) {
  await service.unsaveJob(res.locals.userId, parseUuid(req.params.id as string, NOT_FOUND));
  res.status(204).send();
}