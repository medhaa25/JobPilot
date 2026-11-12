import { z } from "zod";

export const APPLICATION_STATUSES = [
  "SAVED",
  "APPLIED",
  "ONLINE_ASSESSMENT",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "WITHDRAWN",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

const base = z.object({
  jobId: z.uuid().nullish(),
  company: z.string().trim().min(1, "Company is required"),
  jobTitle: z.string().trim().min(1, "Job title is required"),
  jobUrl: z.url("Enter a valid URL").nullish(),
  status: z.enum(APPLICATION_STATUSES),
  appliedAt: z.iso.date("Date must look like 2026-11-04").nullish(),
  notes: z.string().nullish(),
});

// Creating: status is optional and defaults to SAVED.
export const createApplicationSchema = base.extend({
  status: z.enum(APPLICATION_STATUSES).default("SAVED"),
});

// Updating: every field is optional, and nothing gets a default.
export const updateApplicationSchema = base.partial();

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;