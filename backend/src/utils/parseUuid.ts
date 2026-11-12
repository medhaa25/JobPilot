import { z } from "zod";
import { HttpError } from "./HttpError.js";

/** A malformed id would make Postgres throw, so treat it as "not found". */
export function parseUuid(raw: string, notFoundMessage: string): string {
  const parsed = z.uuid().safeParse(raw);
  if (!parsed.success) throw new HttpError(404, notFoundMessage);
  return parsed.data;
}