import { z } from "zod";

// Query-string values always arrive as strings, hence z.coerce for the numbers.
export const jobsQuerySchema = z.object({
  q: z.string().trim().optional(),
  location: z.string().trim().optional(),
  experienceLevel: z.string().optional(),
  employmentType: z.string().optional(),
  source: z.string().optional(),
  sort: z.enum(["newest", "oldest"]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  saved: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
});

export type JobsQuery = z.infer<typeof jobsQuerySchema>;