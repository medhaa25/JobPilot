import type { ApplicationStatus } from "@/types";

/** Body sent to POST /applications and PATCH /applications/:id */
export interface ApplicationInput {
  jobId?: string | null;
  company: string;
  jobTitle: string;
  jobUrl: string | null;
  status: ApplicationStatus;
  appliedAt: string | null;
  notes: string | null;
}
