import { z } from "zod";
import { APPLICATION_STATUSES } from "@/types";
import type { ApplicationInput } from "../types";

export const applicationSchema = z.object({
  company: z.string().trim().min(1, "Company is required"),
  jobTitle: z.string().trim().min(1, "Job title is required"),
  jobUrl: z.union([z.literal(""), z.url("Enter a valid URL (include https://)")]),
  appliedAt: z.string(),
  status: z.enum(APPLICATION_STATUSES),
  notes: z.string(),
});

export type ApplicationFormValues = z.infer<typeof applicationSchema>;

/** Form strings -> API payload (empty strings become null). */
export function toPayload(v: ApplicationFormValues): ApplicationInput {
  return {
    company: v.company,
    jobTitle: v.jobTitle,
    jobUrl: v.jobUrl || null,
    status: v.status,
    appliedAt: v.appliedAt || null,
    notes: v.notes.trim() || null,
  };
}
